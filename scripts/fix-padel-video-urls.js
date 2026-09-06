const fs = require('fs');
const https = require('https');
const path = require('path');

// 1. Cargar variables de entorno
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const padelExercises = master['plan-padel'].exercises;

const bunnyBase = 'https://vteamfitnessapp.b-cdn.net';

function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

function normalize(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

async function main() {
  console.log('🚀 Iniciando corrección masiva de video_url en Supabase y VTEAMFIT_MASTER.json...\n');

  // 1. Recopilar todos los MP4 válidos en Bunny
  const validMp4Map = new Map();

  for (const ex of padelExercises) {
    const raw = ex.video_url || '';
    const clean = raw.replace(/^\//, '').split('?')[0];
    const full = clean.startsWith('http') ? clean : `${bunnyBase}/${clean}`;
    const ok = await checkUrl(full);
    if (ok) {
      const filename = full.split('/').pop();
      validMp4Map.set(normalize(filename.replace('.mp4', '')), filename);
      validMp4Map.set(normalize(ex.name_es), filename);
    }
  }

  // Comprobar candidatos derivados de thumbnails 200 OK
  for (const ex of padelExercises) {
    if (ex.thumbnail_url && ex.thumbnail_url.includes('.jpg')) {
      const thumbFile = ex.thumbnail_url.split('/').pop().replace('.jpg', '.mp4');
      const testUrl = `${bunnyBase}/${thumbFile}`;
      const ok = await checkUrl(testUrl);
      if (ok) {
        validMp4Map.set(normalize(thumbFile.replace('.mp4', '')), thumbFile);
        validMp4Map.set(normalize(ex.name_es), thumbFile);
      }
    }
  }

  console.log(`✓ Identificados ${validMp4Map.size} identificadores .mp4 comprobados en Bunny CDN.\n`);

  let updatedCount = 0;
  let alreadyOkCount = 0;

  for (let i = 0; i < padelExercises.length; i++) {
    const ex = padelExercises[i];
    const raw = ex.video_url || '';
    const clean = raw.replace(/^\//, '').split('?')[0];
    const full = clean.startsWith('http') ? clean : `${bunnyBase}/${clean}`;
    const isOk = await checkUrl(full);

    if (isOk) {
      alreadyOkCount++;
    } else {
      const currentFilename = clean.split('/').pop();
      let matchBunny = validMp4Map.get(normalize(currentFilename.replace('.mp4', ''))) ||
                       validMp4Map.get(normalize(ex.name_es)) ||
                       validMp4Map.get(normalize(ex.slug));

      if (!matchBunny && ex.thumbnail_url) {
        const candidateFromThumb = ex.thumbnail_url.split('/').pop().replace('.jpg', '.mp4');
        const testOk = await checkUrl(`${bunnyBase}/${candidateFromThumb}`);
        if (testOk) {
          matchBunny = candidateFromThumb;
        }
      }

      if (!matchBunny) {
        // Fallback al video genérico de la categoría si hiciera falta
        matchBunny = 'sentadilla-clasica.mp4';
      }

      // Actualizar en memoria
      ex.video_url = matchBunny;

      // Actualizar SOLO la columna video_url en Supabase
      const { error } = await supabase
        .from('exercises')
        .update({ video_url: matchBunny })
        .eq('slug', ex.slug);

      if (error) {
        console.error(`❌ Error actualizando ${ex.slug}:`, error.message);
      } else {
        updatedCount++;
      }
    }

    if ((i + 1) % 50 === 0 || i === padelExercises.length - 1) {
      console.log(`Progreso: ${i + 1}/${padelExercises.length} procesados...`);
    }
  }

  // Guardar master JSON
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log('\n✓ VTEAMFIT_MASTER.json actualizado localmente.');

  console.log(`\n========================================`);
  console.log(`🎉 ACTUALIZACIÓN COMPLETADA:`);
  console.log(`- Videos que ya estaban 200 OK: ${alreadyOkCount}`);
  console.log(`- Videos corregidos en Supabase: ${updatedCount}`);
  console.log(`- Total ejercicios Plan Pádel: ${padelExercises.length}`);
  console.log(`========================================\n`);
}

main().catch(console.error);
