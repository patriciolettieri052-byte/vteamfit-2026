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

const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const padelExercises = master['plan-padel'].exercises;

function checkUrl(url) {
  return new Promise((resolve) => {
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
  console.log('🔍 Mapeando y verificando todos los 279 ejercicios contra Bunny CDN...');

  // 1. Recopilar todos los thumbnails que SÍ dan 200 OK
  const verifiedJpgMap = new Map(); // normalizedName -> validJpgUrl

  for (const ex of padelExercises) {
    const raw = ex.video_url || '';
    const name = raw.replace(/\.mp4(\?.*)?$/i, '').split('/').pop();
    const testUrl = `https://vteamfitnessapp.b-cdn.net/${name}.jpg`;
    const ok = await checkUrl(testUrl);
    if (ok) {
      verifiedJpgMap.set(normalize(ex.name_es), testUrl);
      verifiedJpgMap.set(normalize(name), testUrl);
      verifiedJpgMap.set(normalize(ex.slug), testUrl);
    }
  }

  console.log(`✓ Identificadas ${verifiedJpgMap.size} claves normalizadas con imagen .jpg válida en Bunny.\n`);

  let totalUpdated = 0;
  let stillMissing = [];

  for (const ex of padelExercises) {
    const norm = normalize(ex.name_es);
    const slugNorm = normalize(ex.slug);

    let matchedJpg = verifiedJpgMap.get(norm) || verifiedJpgMap.get(slugNorm);

    if (!matchedJpg) {
      // Fuzzy match
      for (const [key, url] of verifiedJpgMap.entries()) {
        if (norm.includes(key) || key.includes(norm) || slugNorm.includes(key) || key.includes(slugNorm)) {
          matchedJpg = url;
          break;
        }
      }
    }

    if (matchedJpg) {
      ex.thumbnail_url = matchedJpg;
      totalUpdated++;
      // Actualizar en Supabase
      await supabase
        .from('exercises')
        .update({ thumbnail_url: matchedJpg })
        .eq('slug', ex.slug);
    } else {
      stillMissing.push({ slug: ex.slug, name: ex.name_es });
    }
  }

  // Guardar archivo master
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');

  console.log(`\n========================================`);
  console.log(`🎉 RESULTADO FINAL:`);
  console.log(`- Ejercicios con thumbnail .jpg real 200 OK: ${totalUpdated} de 279 (${((totalUpdated/279)*100).toFixed(1)}%)`);
  console.log(`- Pendientes reales sin ninguna coincidencia: ${stillMissing.length}`);
  console.log(`========================================\n`);

  if (stillMissing.length > 0) {
    console.log('Pendientes reales:');
    stillMissing.forEach(m => console.log(`- ${m.name} (${m.slug})`));
  }
}

main().catch(console.error);
