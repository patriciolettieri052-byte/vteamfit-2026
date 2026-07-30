const fs = require('fs');
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
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300 });
    });
    req.on('error', () => resolve({ status: 500, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408, ok: false }); });
    req.end();
  });
}

async function main() {
  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'transforma-tu-cuerpo').single();
  const { data: weeks } = await supabase.from('weeks').select('id').eq('plan_id', plan.id);
  const weekIds = weeks.map(w => w.id);
  const { data: days } = await supabase.from('days').select('id').in('week_id', weekIds);
  const dayIds = days.map(d => d.id);
  const { data: rels } = await supabase.from('day_exercises').select('exercise_id').in('day_id', dayIds);
  const exIds = new Set(rels.map(r => r.exercise_id));

  const { data: exercises } = await supabase.from('exercises').select('id, slug, name_es, video_url').in('id', Array.from(exIds));

  console.log(`Checking ${exercises.length} unique exercises in Transforma Tu Cuerpo...`);

  const missing = [];

  for (const ex of exercises) {
    const vPath = ex.video_url || `${ex.slug}.mp4`;
    const fullUrl = vPath.startsWith('http') ? vPath : `${CDN_BASE}/${vPath.replace(/^\//, '')}`;
    const res = await checkUrl(fullUrl);
    if (!res.ok) {
      missing.push({ slug: ex.slug, name_es: ex.name_es, video_url: ex.video_url, url: fullUrl });
    }
  }

  console.log(`\n🚨 Missing videos in Transforma Tu Cuerpo (${missing.length}):`);
  missing.forEach(m => console.log(`  - [${m.slug}] "${m.name_es}" -> ${m.video_url}`));
}

main();
