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
  if (!plans || plans.length === 0) return;
  
  for (const plan of plans) {
    console.log(`Processing plan: ${plan.name_es}`);
    let md = `# PLAN: ${plan.name_es.toUpperCase()}\n\n`;
    
    // Table Header
    md += `| Semana | Lunes | Martes | Miércoles | Jueves | Viernes | Sábado | Domingo |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;

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

    if (weeksError) continue;

    for (const week of weeks) {
      const sortedDays = (week.days || []).sort((a, b) => a.day_number - b.day_number);
      let row = `| **${week.week_number}** |`;

      for (let i = 0; i < 7; i++) {
        const day = sortedDays[i];
        if (!day) {
          row += ` - |`;
          continue;
        }
        
        if (day.is_rest_day) {
          row += ` *(descanso)* |`;
        } else {
          const { data: exercises } = await supabase
            .from('day_exercises')
            .select(`
              position,
              exercise:exercises (name_es)
            `)
            .eq('day_id', day.id)
            .order('position', { ascending: true });

          if (exercises && exercises.length > 0) {
            const exList = exercises.map(r => {
               const n = Array.isArray(r.exercise) ? r.exercise[0].name_es : r.exercise?.name_es;
               return n;
            }).filter(Boolean).join('<br>• ');
            
            row += ` • ${exList} |`;
          } else {
            row += ` *(sin ej.)* |`;
          }
        }
      }
      md += row + `\n`;
    }
    
    const slugName = plan.slug ? plan.slug : plan.name_es.replace(/\s+/g, '_').toLowerCase();
    const filePath = path.resolve(__dirname, `tabla_plan_${slugName}.md`);
    fs.writeFileSync(filePath, md, 'utf8');
  }
}

run();
