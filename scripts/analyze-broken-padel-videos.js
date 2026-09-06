const fs = require('fs');
const https = require('https');
const path = require('path');

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

async function main() {
  console.log(`🔍 Auditando los ${padelExercises.length} videos del Plan Pádel contra Bunny CDN...`);

  const okList = [];
  const brokenList = [];

  for (let i = 0; i < padelExercises.length; i++) {
    const ex = padelExercises[i];
    const rawVideo = ex.video_url || '';
    const cleanVideo = rawVideo.replace(/^\//, '').split('?')[0];
    const fullVideoUrl = cleanVideo.startsWith('http') ? cleanVideo : `${bunnyBase}/${cleanVideo}`;

    const ok = await checkUrl(fullVideoUrl);
    if (ok) {
      okList.push({ name: ex.name_es, slug: ex.slug, video_url: fullVideoUrl });
    } else {
      brokenList.push({
        name: ex.name_es,
        slug: ex.slug,
        video_url: ex.video_url,
        attempted_url: fullVideoUrl
      });
    }

    if ((i + 1) % 50 === 0 || i === padelExercises.length - 1) {
      console.log(`Verificados ${i + 1}/${padelExercises.length}...`);
    }
  }

  console.log('\n=======================================');
  console.log('📊 RESULTADO DE LA AUDITORÍA DE VIDEOS:');
  console.log(`- Total ejercicios Plan Pádel: ${padelExercises.length}`);
  console.log(`- Videos que reproducen OK (200): ${okList.length} (${((okList.length/padelExercises.length)*100).toFixed(1)}%)`);
  console.log(`- Videos con pantalla negra (404/Error): ${brokenList.length} (${((brokenList.length/padelExercises.length)*100).toFixed(1)}%)`);
  console.log('=======================================\n');

  console.log('Primeros 15 videos con pantalla negra:');
  brokenList.slice(0, 15).forEach(b => {
    console.log(`- "${b.name}" -> ${b.video_url}`);
  });

  fs.writeFileSync('padel_videos_rotos.json', JSON.stringify(brokenList, null, 2));
}

main().catch(console.error);
