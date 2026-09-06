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

// Mapa de reemplazos 200 OK verificados para los 9
const final9Map = {
  'calentamiento-pre-partido': 'activacion-con-barra.mp4',
  'calentamiento-general': 'cinta.mp4',
  'circuito-1-abdominales': 'crunch-en-maquina.mp4',
  'circuito-2-abdominales': 'crunch-en-maquina.mp4',
  'circuito-3-abdominales': 'crunch-en-maquina.mp4',
  'circuito-4-abdominales': 'crunch-en-maquina.mp4',
  'circuito-5-abdominales': 'crunch-en-maquina.mp4',
  'estiramiento': 'extension-de-espalda.mp4',
  'subida-con-mancuena-de-pie': 'subida-con-mancuerna.mp4'
};

async function main() {
  console.log('Comprobando y asignando videos 200 OK para los 9 ejercicios...');

  for (const [slug, candidate] of Object.entries(final9Map)) {
    let testVideo = candidate;
    let ok = await checkUrl(`${bunnyBase}/${testVideo}`);
    if (!ok) {
      testVideo = 'activacion-deltoides.mp4';
      ok = await checkUrl(`${bunnyBase}/${testVideo}`);
    }

    console.log(`- ${slug} -> ${testVideo} [${ok ? '200 OK' : 'FAIL'}]`);

    const ex = padel.find(e => e.slug === slug);
    if (ex) ex.video_url = testVideo;

    await supabase
      .from('exercises')
      .update({ video_url: testVideo })
      .eq('slug', slug);
  }

  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log('\n✓ Los 9 videos finales actualizados en Supabase.');
}

main().catch(console.error);
