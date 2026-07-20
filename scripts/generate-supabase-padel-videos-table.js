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
  console.log('🔍 Querying Supabase for plan-padel exercises and video links...');

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

  let md = `# Plan Pádel - Mapeo de Ejercicios y Videos en Supabase\n\n`;
  md += `> **Fuente:** Base de Datos Supabase (\`plans\` -> \`weeks\` -> \`days\` -> \`day_exercises\` -> \`exercises\`)\n\n`;
  md += `| Semana | Día | Nombre del Ejercicio (Supabase) | Video Bunny CDN (\`video_url\`) |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  let totalLinked = 0;

  for (const week of weeks) {
    const { data: days, error: dErr } = await supabase
      .from('days')
      .select('id, day_number, title, is_rest_day')
      .eq('week_id', week.id)
      .order('day_number', { ascending: true });

    if (dErr) throw dErr;

    for (const day of days) {
      if (day.is_rest_day) {
        md += `| Semana ${week.week_number} | Día ${day.day_number} (${day.title}) | *Día de Descanso* | - |\n`;
      } else {
        const { data: rels, error: rErr } = await supabase
          .from('day_exercises')
          .select('position, exercise:exercises(slug, name_es, video_url)')
          .eq('day_id', day.id)
          .order('position', { ascending: true });

        if (rErr) throw rErr;

        if (rels && rels.length > 0) {
          rels.forEach(r => {
            totalLinked++;
            const exName = r.exercise?.name_es || r.exercise?.slug || 'Sin nombre';
            const rawVideo = r.exercise?.video_url || 'Sin video';
            const videoUrl = rawVideo.startsWith('http') ? rawVideo : `https://vteamfitjuly2026.b-cdn.net/${rawVideo}`;
            md += `| Semana ${week.week_number} | Día ${day.day_number} (${day.title}) | **${exName}** | [\`${rawVideo}\`](${videoUrl}) |\n`;
          });
        }
      }
    }
  }

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/tabla_plan_padel_videos_supabase.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ Table generated successfully at ${ARTIFACT_PATH}`);
  console.log(`📊 Total weeks: ${weeks.length}, Total exercise-video links logged: ${totalLinked}`);
}

generateTable().catch(console.error);
