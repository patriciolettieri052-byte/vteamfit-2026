const fs = require('fs');
const https = require('https');
const path = require('path');

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

  // Also check thumbnails base names as MP4 candidates
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

  const rows = [];
  for (const ex of padelExercises) {
    const raw = ex.video_url || '';
    const clean = raw.replace(/^\//, '').split('?')[0];
    const full = clean.startsWith('http') ? clean : `${bunnyBase}/${clean}`;
    const isOk = await checkUrl(full);

    if (!isOk) {
      const currentInSupabase = clean.split('/').pop();
      let matchBunny = validMp4Map.get(normalize(currentInSupabase.replace('.mp4', ''))) ||
                       validMp4Map.get(normalize(ex.name_es)) ||
                       validMp4Map.get(normalize(ex.slug));

      if (!matchBunny && ex.thumbnail_url) {
        const candidateFromThumb = ex.thumbnail_url.split('/').pop().replace('.jpg', '.mp4');
        matchBunny = candidateFromThumb;
      }

      rows.push({
        name: ex.name_es,
        supabase: currentInSupabase,
        bunny: matchBunny || 'No encontrado'
      });
    }
  }

  let md = `# Cotejo de Videos con Pantalla Negra (Plan Pádel)\n\n`;
  md += `> **Total de videos que no se ven en la app:** ${rows.length} de ${padelExercises.length}\n\n`;
  md += `| Cómo se llama el .mp4 en Bunny CDN | Cómo se llama en Supabase (\`video_url\`) |\n`;
  md += `| :--- | :--- |\n`;

  rows.forEach(r => {
    md += `| \`${r.bunny}\` | \`${r.supabase}\` |\n`;
  });

  const targetPath = 'C:\\\\Users\\\\59892\\\\.gemini\\\\antigravity\\\\brain\\\\805a4449-d2aa-41b3-b098-e76261180ece\\\\tabla_videos_rotos_supabase_vs_bunny.md';
  fs.writeFileSync(targetPath, md, 'utf8');
  console.log('✓ Archivo escrito con exito');
}

main().catch(console.error);
