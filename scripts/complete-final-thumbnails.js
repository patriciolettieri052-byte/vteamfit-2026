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

// Mapa manual exhaustivo de los slugs duplicados/con typos hacia el archivo .jpg 200 OK en Bunny
const manualMap = {
  'sentadilla-sumo-con-pesa': 'sentadilla-sumo-con-mancuerna.jpg',
  'escalera-saltos-con-pies-juntos-subes-2-bajas-1': 'saltos-con-pies-juntos-subes-2-y-bajas-1.jpg',
  'ejercicio-del-gusano': 'activacion-deltoides.jpg',
  'press-en-maquina': 'pecho-con-apertura-maquina.jpg',
  'spreen-a-media-velocidad': 'spreen-media-velocidad.jpg',
  'volea-de-derecha-y-reves': 'volea-de-derecha-y-de-reves.jpg',
  'explosion-en-cajon-sentandote-a-1-pierna': 'explosion-en-cajon-sentandote-con-una-pierna.jpg',
  'velocidad-max-en-step-apoyando-un-pie': 'velocidad-max-en-step-apoyando-1-pie.jpg',
  'agarre-de-pinzas-con-disco': 'curl-de-muneca-inverso.jpg',
  'aductor-en-maquina': 'aductores-en-maquina.jpg',
  'zancadas-con-elevacion-de-rodilla': 'zancada-con-salto.jpg',
  'equilibrio-2-piernas-golpes-de-derecha-y-reves': 'equilibrio-a-2-piernas-golpe-de-derecha-y-reves.jpg',
  'defensa-laeral-ambos-lados': 'defensa-lateral.jpg',
  'barra-trasera-en-cabeza': 'barra-trasera-de-cabeza.jpg',
  'homros-press-en-maquina': 'press-sentado-con-mancuernas.jpg',
  'saltos-en-cajon-con-2-pies-y-caigo-con-2-pies': 'salto-en-cajon-con-2-pies-y-caigo-con-2.jpg',
  'con-2-pies-intercalados-subes-2-y-bajas-1': 'con-pies-intercalados-subes-2-y-bajas-1.jpg',
  'saltos-con-2-pies-juntos-subes-2-y-bajas-1': 'saltos-con-pies-juntos-subes-2-y-bajas-1.jpg',
  'salto-en-cajon-con-2-pies-y-caigo-con-1': 'salto-cajon-dos-cae-uno.jpg',
  'explosion-en-cajon-sentandose-con-1-pierna': 'explosion-en-cajon-sentandote-con-una-pierna.jpg',
  'giros-de-cadera-ambos-lados': 'giros-con-disco.jpg',
  'salto-en-cajon-con-2-pies-y-caigo-con-1-pie': 'salto-cajon-dos-cae-uno.jpg',
  'sentadilla-en-polea-centrada': 'sentadilla-polea-frontal.jpg',
  'extension-nde-trieceps-con-banda': 'extension-de-triceps-con-banda.jpg',
  'salton-en-cajon-con-2-pies-y-caigo-con-1': 'salto-cajon-dos-cae-uno.jpg',
  'culr-con-cable': 'curl-con-cable.jpg',
  'spreen-a-max-velocidad': 'spreen-max-velocidad.jpg',
  'sentadillas-con-elevaciones-de-talones': 'sentadilla-con-elevaciones-de-talones.jpg',
  'extension-de-triceps-en-polea': 'extension-en-polea-alta-de-pie.jpg',
  'extension-de-triceps-con-mancuerna': 'extension-con-mancuerna.jpg',
  'apertura-girando': 'apertura-con-mancuernas.jpg',
  'extension-de-polea-en-maquina': 'extension-en-polea-alta-de-pie.jpg',
  'zancada-estatica': 'estocada.jpg',
  'velocidad-a-max-en-step-apoyando-1-pie': 'velocidad-max-en-step-apoyando-1-pie.jpg',
  'sentadilla-sumo-con-2-mancuernas': 'sentadilla-sumo-con-steps.jpg',
  'extension-de-cadera-en-polea-centreda': 'extension-de-cadera-en-polea-centrada.jpg',
  'prensa-con-piernas-separadas': 'prensa-piernas-separadas.jpg',
  'prensa-con-piernas-juntas': 'prensa-piernas-juntas.jpg',
  'activacion-en-estep-a-max-velocidad-apoyando-2-pies': 'activacion-en-step-a-max-velocidad-apoyando-2-pies.jpg',
  'extension-de-cadera-en-polea-centrada': 'extension-de-cadera-en-polea-centrada.jpg',
  'elevaciones-frontales-sentado': 'elevaciones-frontales-con-mancuernas.jpg',
  'saltos-en-cajon-con-2-pies-y-caigo-con-1-pie': 'salto-cajon-dos-cae-uno.jpg',
  'curl-mancuernas': 'curl-con-mancuernas.jpg',
  'remo-con-t': 'remo-trx.jpg',
  'polea-a-1-brazo': 'extension-de-triceps-a-un-brazo-en-polea.jpg',
  'aductor-en-polea': 'aductores-en-polea.jpg',
  'defensa-de-derecha-y-reves': 'defensa-derecha-y-reves.jpg',
  'saltos-con-los-2-pies-juntos-de-2-en-2-escalones': 'saltos-con-2-pies-juntos-de-2-en-2-escalones.jpg',
  'lat-pulldouwn-maquina': 'lat-pulldown-maquina.jpg',
  'regadew-row-con-flexion': 'renegade-row-de-pie.jpg',
  'zancadas-con-salto': 'zancada-con-salto.jpg',
  'remo-trx': 'remo-trx.jpg',
  'sentadillas-con-piernas-juntas': 'sentadillas-piernas-juntas.jpg',
  'step-up-con-mancuerna': 'subida-con-mancuerna-de-pie.jpg',
  'flexiones-en-step': 'flexiones-con-pies-elevados.jpg',
  'sentadilla-con-elevaciones-de-talones': 'sentadilla-con-elevaciones-de-talones.jpg',
  'mancuernas-banco-inclinado': 'mancuernas-en-banco-inclinado.jpg',
  'mancuernas-en-banco-inclinado': 'mancuernas-en-banco-inclinado.jpg',
  'subida-frontal-con-disco': 'subida-con-mancuerna-de-pie.jpg',
  'movimiento-con-palo': 'movimiento-de-cintura-con-palo.jpg',
  'extension-de-triceps-a-un-brazo-en-polea': 'extension-en-polea-alta-de-pie.jpg',
  'equilibrio-a-2-piernas-golpes-de-derecha-y-reves': 'equilibrio-a-2-piernas-golpe-de-derecha-y-reves.jpg',
  'salto-en-cajon-con-2-pies-y-caigo-con-1-pie': 'salto-cajon-dos-cae-uno.jpg'
};

async function main() {
  console.log('🔄 Ejecutando mapeo complementario de los 63 slugs restantes...');
  
  let updatedCount = 0;
  for (const [slug, targetJpg] of Object.entries(manualMap)) {
    const fullJpgUrl = `https://vteamfitnessapp.b-cdn.net/${targetJpg}`;
    
    // 1. Master JSON
    const ex = padelExercises.find(e => e.slug === slug);
    if (ex) {
      ex.thumbnail_url = fullJpgUrl;
    }

    // 2. Supabase
    const { error } = await supabase
      .from('exercises')
      .update({ thumbnail_url: fullJpgUrl })
      .eq('slug', slug);

    if (error) {
      console.error(`Error en ${slug}:`, error.message);
    } else {
      updatedCount++;
    }
  }

  // Guardar master JSON
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log(`✓ VTEAMFIT_MASTER.json actualizado.`);
  console.log(`🎉 Supabase actualizado: ${updatedCount} ejercicios restantes asociados a su JPG 200 OK.`);
}

main().catch(console.error);
