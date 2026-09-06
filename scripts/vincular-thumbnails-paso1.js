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

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function main() {
  console.log('🚀 Iniciando PASO 1: Vinculación de thumbnails .jpg existentes en Bunny CDN...');
  
  const updatedExercises = [];
  const missingJpgExercises = [];

  for (let i = 0; i < padelExercises.length; i++) {
    const ex = padelExercises[i];
    const rawVideo = ex.video_url || '';
    const videoName = rawVideo.replace(/\.mp4(\?.*)?$/i, '');
    const cleanVideoName = videoName.startsWith('http') ? videoName.split('/').pop() : videoName;
    const candidateJpgUrl = `https://vteamfitnessapp.b-cdn.net/${cleanVideoName}.jpg`;

    const exists = await checkUrl(candidateJpgUrl);

    if (exists) {
      ex.thumbnail_url = candidateJpgUrl;
      updatedExercises.push({
        slug: ex.slug,
        name: ex.name_es,
        thumbnail_url: candidateJpgUrl
      });
    } else {
      missingJpgExercises.push({
        slug: ex.slug,
        name: ex.name_es,
        video_filename: `${cleanVideoName}.mp4`,
        expected_jpg: `${cleanVideoName}.jpg`
      });
    }

    if ((i + 1) % 50 === 0 || i === padelExercises.length - 1) {
      console.log(`Verificados ${i + 1}/${padelExercises.length}...`);
    }
  }

  console.log(`\n📊 Resumen de comprobación:`);
  console.log(`- Ejercicios con .jpg en Bunny listos para vincular: ${updatedExercises.length}`);
  console.log(`- Ejercicios pendientes de .jpg (Paso 2): ${missingJpgExercises.length}`);

  // 2. Actualizar VTEAMFIT_MASTER.json
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log('✓ VTEAMFIT_MASTER.json actualizado localmente.');

  // Guardar archivo con los faltantes para el Paso 2
  fs.writeFileSync('faltantes_thumbnails_paso2.json', JSON.stringify(missingJpgExercises, null, 2), 'utf8');
  console.log('✓ Listado de pendientes guardado en faltantes_thumbnails_paso2.json');

  // 3. Actualizar Supabase
  console.log('\n🔄 Actualizando base de datos en Supabase...');
  let dbSuccessCount = 0;

  for (const item of updatedExercises) {
    const { error } = await supabase
      .from('exercises')
      .update({ thumbnail_url: item.thumbnail_url })
      .eq('slug', item.slug);

    if (error) {
      console.error(`❌ Error al actualizar ${item.slug}:`, error.message);
    } else {
      dbSuccessCount++;
    }
  }

  console.log(`\n🎉 PASO 1 COMPLETADO: ${dbSuccessCount} ejercicios actualizados en Supabase.`);
}

main().catch(console.error);
