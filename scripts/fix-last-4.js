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

const last4 = {
  'sentadilla-sumo-con-pesa': 'sentadilla-clasica.jpg',
  'step-up-con-mancuerna': 'zancada-con-salto.jpg',
  'mancuernas-banco-inclinado': 'aperturas-con-mancuernas-tumbado.jpg',
  'mancuernas-en-banco-inclinado': 'aperturas-con-mancuernas-tumbado.jpg',
  'subida-frontal-con-disco': 'elevaciones-frontales-con-mancuernas.jpg'
};

async function main() {
  for (const [slug, targetJpg] of Object.entries(last4)) {
    const fullUrl = `https://vteamfitnessapp.b-cdn.net/${targetJpg}`;
    const ok = await checkUrl(fullUrl);
    console.log(`- ${slug} -> ${targetJpg} [${ok ? '200 OK' : '404 FAIL'}]`);

    if (ok) {
      const ex = padelExercises.find(e => e.slug === slug);
      if (ex) ex.thumbnail_url = fullUrl;

      await supabase
        .from('exercises')
        .update({ thumbnail_url: fullUrl })
        .eq('slug', slug);
    }
  }

  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log('\n✓ Últimos 4 actualizados con éxito.');
}

main().catch(console.error);
