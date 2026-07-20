const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'plan-padel').single();
  const { data: week } = await supabase.from('weeks').select('id, week_number').eq('plan_id', plan.id).eq('week_number', 1).single();
  const { data: days } = await supabase.from('days').select('id, day_number, title, is_rest_day').eq('week_id', week.id).order('day_number');

  for (const day of days) {
    console.log(`\n--- Day ${day.day_number} ${day.title} ${day.is_rest_day ? '(REST)' : ''}`);
    const { data: rels } = await supabase.from('day_exercises').select('position, exercise:exercises(slug, name_es, categoria)').eq('day_id', day.id).order('position');
    console.log(`   Total exercises linked: ${rels ? rels.length : 0}`);
    if (rels) {
      rels.forEach(r => console.log(`   Pos ${r.position}: ${r.exercise.name_es} [Categoría: ${r.exercise.categoria}]`));
    }
  }
}

test().catch(console.error);
