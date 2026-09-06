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

// Slugs de los 13 ejercicios y sus alternativas 100% verificadas 200 OK
const fix13 = {
  'sentadilla-sumo-con-pesa': 'sentadillas.jpg',
  'salton-en-cajon-con-2-pies-y-caigo-con-1-pie': 'salto-en-cajon-a-2-pies.jpg',
  'sentadillas-con-elevaciones-de-talones': 'sentadilla-clasica.jpg',
  'extension-de-cadera-en-polea-centreda': 'extension-en-polea-alta-de-pie.jpg',
  'extension-de-cadera-en-polea-centrada': 'extension-en-polea-alta-de-pie.jpg',
  'remo-con-t': 'remo-invertido.jpg',
  'polea-a-1-brazo': 'cross-en-polea.jpg',
  'remo-trx': 'remo-invertido.jpg',
  'step-up-con-mancuerna': 'subida-con-mancuena-de-pie.jpg',
  'sentadilla-con-elevaciones-de-talones': 'sentadilla-clasica.jpg',
  'mancuernas-banco-inclinado': 'press-banco-inclinado-con-mancuerna.jpg',
  'mancuernas-en-banco-inclinado': 'press-banco-inclinado-con-mancuerna.jpg',
  'subida-frontal-con-disco': 'subida-con-mancuena-de-pie.jpg'
};

async function main() {
  console.log('Verificando y aplicando asignaciones finales para los 13 ejercicios...');

  for (const [slug, targetJpg] of Object.entries(fix13)) {
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
  console.log('\n✓ Archivo maestro y Supabase actualizados.');
}

main().catch(console.error);
