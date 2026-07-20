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

async function generateTable() {
  console.log('🔍 Querying Supabase for plan-padel data...');

  const { data: plan, error: pErr } = await supabase
    .from('plans')
    .select('id, name_es')
    .eq('slug', 'plan-padel')
    .single();

  if (pErr || !plan) {
    throw new Error('Plan-padel not found in Supabase: ' + JSON.stringify(pErr));
  }

  const { data: weeks, error: wErr } = await supabase
    .from('weeks')
    .select('id, week_number')
    .eq('plan_id', plan.id)
    .order('week_number', { ascending: true });

  if (wErr) throw wErr;

  let md = `# Plan Pádel - Estructura Completa en Base de Datos (Supabase)\n\n`;
  md += `> **Fuente:** Base de Datos Supabase (Tabla \`plans\` -> \`weeks\` -> \`days\` -> \`day_exercises\` -> \`exercises\`)\n\n`;
  md += `| Semana | Día | Día Título | Categoría | Ejercicios |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  let totalExercisesCount = 0;

  for (const week of weeks) {
    const { data: days, error: dErr } = await supabase
      .from('days')
      .select('id, day_number, title, is_rest_day')
      .eq('week_id', week.id)
      .order('day_number', { ascending: true });

    if (dErr) throw dErr;

    for (const day of days) {
      if (day.is_rest_day) {
        md += `| Semana ${week.week_number} | Día ${day.day_number} | ${day.title} | Descanso | *Día de Descanso* |\n`;
      } else {
        const { data: rels, error: rErr } = await supabase
          .from('day_exercises')
          .select('position, exercise:exercises(slug, name_es, categoria)')
          .eq('day_id', day.id)
          .order('position', { ascending: true });

        if (rErr) throw rErr;

        totalExercisesCount += rels ? rels.length : 0;

        const categoriesSet = new Set();
        const exercisesList = (rels || []).map((r, i) => {
          const cat = r.exercise?.categoria || 'padel';
          categoriesSet.add(cat);
          return `${i + 1}. ${r.exercise?.name_es || r.exercise?.slug}`;
        });

        const categoriesStr = Array.from(categoriesSet).join(', ');
        const exercisesStr = exercisesList.join('<br>');

        md += `| Semana ${week.week_number} | Día ${day.day_number} | ${day.title} | ${categoriesStr} | ${exercisesStr} |\n`;
      }
    }
  }

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/tabla_plan_padel_supabase.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ Table generated successfully at ${ARTIFACT_PATH}`);
  console.log(`📊 Total weeks: ${weeks.length}, Total exercises entries logged: ${totalExercisesCount}`);
}

generateTable().catch(console.error);
