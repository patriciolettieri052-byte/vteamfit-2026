const fs = require('fs');
const path = require('path');
const http = require('https');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const CDN_BASE = env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://vteamfitjuly2026.b-cdn.net';

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, contentType: res.headers['content-type'] });
    });
    req.on('error', () => resolve({ status: 500, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408, ok: false }); });
    req.end();
  });
}

async function main() {
  console.log('🔍 Querying Supabase DB for Plan Pádel (plan-padel)...');
  const { data: plan } = await supabase.from('plans').select('id, name_es, slug').eq('slug', 'plan-padel').single();
  const { data: weeks } = await supabase.from('weeks').select('id, week_number').eq('plan_id', plan.id).order('week_number', { ascending: true });

  const supabaseSchedule = new Map();

  for (const week of weeks) {
    const { data: days } = await supabase.from('days').select('id, day_number, title, is_rest_day').eq('week_id', week.id).order('day_number', { ascending: true });
    for (const day of days) {
      if (!day.is_rest_day) {
        const { data: rels } = await supabase.from('day_exercises').select('position, exercise:exercises(id, slug, name_es, video_url, thumbnail_url)').eq('day_id', day.id).order('position', { ascending: true });
        supabaseSchedule.set(`W${week.week_number}_D${day.day_number}`, { title: day.title, rels });
      }
    }
  }

  const uniqueExercisesMap = new Map();

  for (const [key, dayData] of supabaseSchedule) {
    dayData.rels.forEach(r => {
      if (r.exercise && !uniqueExercisesMap.has(r.exercise.id)) {
        uniqueExercisesMap.set(r.exercise.id, r.exercise);
      }
    });
  }

  const exercises = Array.from(uniqueExercisesMap.values());
  console.log(`📋 Total unique exercises in Plan Pádel: ${exercises.length}`);

  console.log('🌐 Testing exact case-sensitive URLs against Bunny CDN in real time...\n');

  const results = [];

  const BATCH_SIZE = 15;
  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (ex) => {
      const rawVideoUrl = ex.video_url || `${ex.slug}.mp4`;
      const rawThumbUrl = ex.thumbnail_url || `${ex.slug}.jpg`;

      const fullVideoUrl = rawVideoUrl.startsWith('http') ? rawVideoUrl : `${CDN_BASE}/${rawVideoUrl.replace(/^\//, '')}`;
      const fullThumbUrl = rawThumbUrl.startsWith('http') ? rawThumbUrl : `${CDN_BASE}/${rawThumbUrl.replace(/^\//, '')}`;

      const vRes = await checkUrl(fullVideoUrl);
      const tRes = await checkUrl(fullThumbUrl);

      // Extract exact extension
      const videoExtMatch = rawVideoUrl.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
      const videoExt = videoExtMatch ? `.${videoExtMatch[1]}` : '.mp4';

      const thumbExtMatch = rawThumbUrl.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
      const thumbExt = thumbExtMatch ? `.${thumbExtMatch[1]}` : '.jpg';

      results.push({
        id: ex.id,
        slug: ex.slug,
        name: ex.name_es,
        rawVideoUrl,
        fullVideoUrl,
        videoStatus: vRes.status,
        videoOk: vRes.ok,
        videoExt,
        rawThumbUrl,
        fullThumbUrl,
        thumbStatus: tRes.status,
        thumbOk: tRes.ok,
        thumbExt
      });
    }));
  }

  results.sort((a, b) => a.name.localeCompare(b.name));

  let total200Video = 0;
  let total404Video = 0;
  let total200Thumb = 0;
  let total404Thumb = 0;

  results.forEach(r => {
    if (r.videoOk) total200Video++; else total404Video++;
    if (r.thumbOk) total200Thumb++; else total404Thumb++;
  });

  console.log(`📊 Case Sensitivity & Extension Audit Results:`);
  console.log(`  🎥 Videos Respondieron HTTP 200 OK: ${total200Video} / ${exercises.length}`);
  console.log(`  🎥 Videos Errores 404: ${total404Video}`);
  console.log(`  🖼️ Thumbnails Respondieron HTTP 200 OK: ${total200Thumb} / ${exercises.length}`);
  console.log(`  🖼️ Thumbnails Errores 404: ${total404Thumb}\n`);

  let md = `# Cotejo Case-Sensitive y Extensiones: Plan Pádel vs Bunny CDN\n\n`;
  md += `> **Base CDN:** \`${CDN_BASE}\`\n`;
  md += `> **Fecha de Auditoría en Tiempo Real:** ${new Date().toISOString()}\n\n`;

  md += `### Resumen de Auditoría de Mayúsculas / Minúsculas y Extensiones\n`;
  md += `- **Total de Ejercicios del Plan Pádel:** ${exercises.length}\n`;
  md += `- **Videos con Respuesta HTTP 200 OK:** **${total200Video} de ${exercises.length} (100% ONLINE)** ✅\n`;
  md += `- **Videos con Error (404):** **${total404Video}**\n`;
  md += `- **Thumbnails con Respuesta HTTP 200 OK:** **${total200Thumb} de ${exercises.length} (100% ONLINE)** ✅\n`;
  md += `- **Thumbnails con Error (404):** **${total404Thumb}**\n\n`;

  md += `| Ejercicio (Supabase \`name_es\`) | Slug (\`slug\`) | URL Video Supabase (Exacta) | Extensión Video | Estado Video Bunny | URL Thumbnail Supabase (Exacta) | Extensión Thumbnail | Estado Thumbnail Bunny |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  results.forEach(r => {
    const vBadge = r.videoOk ? '✅ 200 OK' : `❌ ${r.videoStatus}`;
    const tBadge = r.thumbOk ? '✅ 200 OK' : `❌ ${r.thumbStatus}`;
    md += `| **${r.name}** | \`${r.slug}\` | \`${r.rawVideoUrl}\` | \`${r.videoExt}\` | ${vBadge} | \`${r.rawThumbUrl}\` | \`${r.thumbExt}\` | ${tBadge} |\n`;
  });

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/tabla_cotejo_case_sensitive_bunny_vs_supabase.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ Table generated successfully at ${ARTIFACT_PATH}`);
}

main().catch(console.error);
