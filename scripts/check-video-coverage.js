const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCoverage() {
  console.log('🔍 Checking video URL coverage for Plan Pádel exercises in Supabase...');

  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'plan-padel').single();
  const { data: weeks } = await supabase.from('weeks').select('id').eq('plan_id', plan.id);
  const weekIds = weeks.map(w => w.id);
  
  const { data: days } = await supabase.from('days').select('id').in('week_id', weekIds);
  const dayIds = days.map(d => d.id);

  const { data: rels } = await supabase
    .from('day_exercises')
    .select('exercise:exercises(id, slug, name_es, video_url)')
    .in('day_id', dayIds);

  const uniqueExercises = new Map();
  rels.forEach(r => {
    if (r.exercise && !uniqueExercises.has(r.exercise.id)) {
      uniqueExercises.set(r.exercise.id, r.exercise);
    }
  });

  let totalCount = uniqueExercises.size;
  let missingCount = 0;
  let hasUrlCount = 0;
  const missingList = [];
  const uniqueVideos = new Set();

  uniqueExercises.forEach(ex => {
    if (!ex.video_url || ex.video_url.trim() === '' || ex.video_url === 'placeholder.mp4') {
      missingCount++;
      missingList.push(ex);
    } else {
      hasUrlCount++;
      uniqueVideos.add(ex.video_url);
    }
  });

  console.log(`\n📊 ANÁLISIS DE COBERUTRA DE VIDEOS EN PLAN PÁDEL:`);
  console.log(`- Total de ejercicios únicos en Plan Pádel: ${totalCount}`);
  console.log(`- Ejercicios con string de video (video_url): ${hasUrlCount} (${((hasUrlCount/totalCount)*100).toFixed(1)}%)`);
  console.log(`- Ejercicios sin video_url o vacíos: ${missingCount}`);
  console.log(`- Archivos .mp4 únicos referenciados: ${uniqueVideos.size}`);

  if (missingList.length > 0) {
    console.log(`\n⚠️ Ejercicios faltantes (${missingList.length}):`);
    missingList.forEach(ex => console.log(`  - [${ex.slug}] ${ex.name_es}`));
  } else {
    console.log(`\n✅ El 100% de los ejercicios del Plan Pádel poseen una URL/slug de video asociada en Supabase.`);
  }
}

checkCoverage().catch(console.error);
