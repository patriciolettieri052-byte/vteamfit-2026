const fs = require('fs');
const https = require('https');
const path = require('path');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const master = JSON.parse(fs.readFileSync('VTEAMFIT_MASTER.json', 'utf8'));
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
  console.log('🔍 Construyendo tabla comparativa de videos que dan pantalla negra...');

  // 1. Recopilar todos los MP4 válidos en Bunny
  const validMp4Set = new Set();
  const validMp4Map = new Map();

  for (const ex of padelExercises) {
    const raw = ex.video_url || '';
    const clean = raw.replace(/^\//, '').split('?')[0];
    const full = clean.startsWith('http') ? clean : `${bunnyBase}/${clean}`;
    const ok = await checkUrl(full);
    if (ok) {
      const filename = full.split('/').pop();
      validMp4Set.add(filename);
      validMp4Map.set(normalize(filename.replace('.mp4', '')), filename);
      validMp4Map.set(normalize(ex.name_es), filename);
    }
  }

  // Also check thumbnails base names as MP4 candidates
  for (const ex of padelExercises) {
    if (ex.thumbnail_url && ex.thumbnail_url.includes('.jpg')) {
      const thumbFile = ex.thumbnail_url.split('/').pop().replace('.jpg', '.mp4');
      const testUrl = `${bunnyBase}/${thumbFile}`;
      const ok = await checkUrl(testUrl);
      if (ok) {
        validMp4Set.add(thumbFile);
        validMp4Map.set(normalize(thumbFile.replace('.mp4', '')), thumbFile);
        validMp4Map.set(normalize(ex.name_es), thumbFile);
      }
    }
  }

  console.log(`✓ Archivos .mp4 válidos y confirmados en Bunny CDN: ${validMp4Set.size}\n`);

  // 2. Analizar los 279 ejercicios del Plan Pádel
  const comparisonList = [];

  for (const ex of padelExercises) {
    const raw = ex.video_url || '';
    const clean = raw.replace(/^\//, '').split('?')[0];
    const full = clean.startsWith('http') ? clean : `${bunnyBase}/${clean}`;
    const isOk = await checkUrl(full);

    if (!isOk) {
      const currentInSupabase = clean.split('/').pop();
      
      // Buscar el nombre correcto en Bunny
      let matchBunny = validMp4Map.get(normalize(currentInSupabase.replace('.mp4', ''))) ||
                       validMp4Map.get(normalize(ex.name_es)) ||
                       validMp4Map.get(normalize(ex.slug));

      if (!matchBunny && ex.thumbnail_url) {
        const candidateFromThumb = ex.thumbnail_url.split('/').pop().replace('.jpg', '.mp4');
        if (validMp4Set.has(candidateFromThumb)) {
          matchBunny = candidateFromThumb;
        }
      }

      if (!matchBunny) {
        // Fuzzy search
        const norm = normalize(ex.name_es);
        for (const [key, val] of validMp4Map.entries()) {
          if (norm.includes(key) || key.includes(norm)) {
            matchBunny = val;
            break;
          }
        }
      }

      comparisonList.push({
        nombre_ejercicio: ex.name_es,
        slug: ex.slug,
        en_supabase: currentInSupabase,
        en_bunny: matchBunny || 'No encontrado'
      });
    }
  }

  console.log(`Total de videos que no se ven en el Plan Pádel: ${comparisonList.length}`);

  // 3. Generar documento Markdown
  let md = `# Tabla Comparativa de Videos con Pantalla Negra: Supabase vs Bunny CDN\n\n`;
  md += `> **Total de videos que dan pantalla negra:** ${comparisonList.length} de ${padelExercises.length}\n\n`;
  md += `| Ejercicio (Nombre) | Cómo se llama en Supabase (\`video_url\`) | Cómo se llama el .mp4 real en Bunny CDN |\n`;
  md += `| :--- | :--- | :--- |\n`;

  comparisonList.forEach(item => {
    md += `| **${item.nombre_ejercicio}** | \`${item.en_supabase}\` | \`${item.en_bunny}\` |\n`;
  });

  fs.writeFileSync(path.join(process.cwd(), 'tabla_videos_comparativa.json'), JSON.stringify(comparisonList, null, 2), 'utf8');
  console.log(`\n✓ JSON guardado en ${path.join(process.cwd(), 'tabla_videos_comparativa.json')}`);
}

main().catch(console.error);
