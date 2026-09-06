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
const padel = master['plan-padel'].exercises;
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

async function run() {
  console.log('🔄 Sincronizando 1 a 1 video_url en Supabase y verificando...');
  let updated = 0;
  let okCount = 0;
  let failCount = 0;

  for (let i = 0; i < padel.length; i++) {
    const ex = padel[i];
    let target = ex.video_url || '';
    let full = target.startsWith('http') ? target : `${bunnyBase}/${target.replace(/^\//, '')}`;
    
    let isOk = await checkUrl(full);

    if (!isOk && ex.thumbnail_url && ex.thumbnail_url.includes('.jpg')) {
      const candidate = ex.thumbnail_url.split('/').pop().replace('.jpg', '.mp4');
      const testOk = await checkUrl(`${bunnyBase}/${candidate}`);
      if (testOk) {
        target = candidate;
        ex.video_url = candidate;
        isOk = true;
      }
    }

    if (isOk) {
      okCount++;
    } else {
      failCount++;
    }

    const { error } = await supabase
      .from('exercises')
      .update({ video_url: target })
      .eq('slug', ex.slug);

    if (!error) updated++;

    if ((i + 1) % 50 === 0 || i === padel.length - 1) {
      console.log(`Progreso: ${i + 1}/${padel.length} (${okCount} OK, ${failCount} errores)...`);
    }
  }

  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');

  console.log('\n=======================================');
  console.log('📊 RESULTADO DE LA SINCRONIZACIÓN:');
  console.log(`- Total ejercicios: ${padel.length}`);
  console.log(`- Supabase actualizados: ${updated}`);
  console.log(`- Videos con reproducción 200 OK: ${okCount} (${((okCount/padel.length)*100).toFixed(1)}%)`);
  console.log(`- Videos fallidos: ${failCount}`);
  console.log('=======================================\n');
}

run().catch(console.error);
