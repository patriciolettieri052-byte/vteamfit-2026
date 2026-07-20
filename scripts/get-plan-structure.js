const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: plans } = await supabase.from('plans').select('id, name_es, slug');
  if (!plans || plans.length === 0) {
    console.log("No plans found");
    return;
  }
  
  const plan = plans[0]; // Pick the first plan

  let md = `# PLAN: ${plan.name_es.toUpperCase()}\n\n`;

  const { data: weeks, error: weeksError } = await supabase
    .from('weeks')
    .select(`
      id,
      week_number,
      days (
        id,
        day_number,
        is_rest_day
      )
    `)
    .eq('plan_id', plan.id)
    .order('week_number', { ascending: true });

  if (weeksError) {
    console.error(weeksError);
    return;
  }

  const DAY_NAMES = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  for (const week of weeks) {
    md += `## SEMANA ${week.week_number}\n`;
    const sortedDays = (week.days || []).sort((a, b) => a.day_number - b.day_number);

    for (const day of sortedDays) {
      const dayName = DAY_NAMES[(day.day_number - 1) % 7];
      md += `${dayName}\n`;
      
      if (day.is_rest_day) {
        md += `(descanso)\n\n`;
      } else {
        const { data: exercises, error: exError } = await supabase
          .from('day_exercises')
          .select(`
            position,
            exercise:exercises (
              name_es
            )
          `)
          .eq('day_id', day.id)
          .order('position', { ascending: true });

        if (exError) {
          console.error(exError);
          continue;
        }

        if (exercises && exercises.length > 0) {
          for (const row of exercises) {
            const exName = Array.isArray(row.exercise) ? row.exercise[0].name_es : row.exercise?.name_es;
            md += `(${exName})\n`;
          }
        } else {
          md += `(sin ejercicios)\n`;
        }
        md += `\n`;
      }
    }
  }
  
  fs.writeFileSync(path.resolve(__dirname, 'plan-output.md'), md, 'utf8');
  console.log("Done");
}

run();
