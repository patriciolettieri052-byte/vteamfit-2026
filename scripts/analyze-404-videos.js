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
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300 });
    });
    req.on('error', () => resolve({ status: 500, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408, ok: false }); });
    req.end();
  });
}

async function main() {
  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'plan-padel').single();
  const { data: weeks } = await supabase.from('weeks').select('id').eq('plan_id', plan.id);
  const weekIds = weeks.map(w => w.id);
  const { data: days } = await supabase.from('days').select('id').in('week_id', weekIds);
  const dayIds = days.map(d => d.id);
  const { data: rels } = await supabase.from('day_exercises').select('exercise_id').in('day_id', dayIds);
  const padelExerciseIds = new Set(rels.map(r => r.exercise_id));

  const { data: exercises } = await supabase.from('exercises').select('id, slug, name_es, video_url');

  console.log(`Checking ${exercises.length} exercises...\n`);

  const padel404 = [];
  const other404 = [];
  const padel200 = [];

  for (let i = 0; i < exercises.length; i += 15) {
    const batch = exercises.slice(i, i + 15);
    await Promise.all(batch.map(async (ex) => {
      const videoPath = ex.video_url || `${ex.slug}.mp4`;
      const fullUrl = videoPath.startsWith('http') ? videoPath : `${CDN_BASE}/${videoPath.replace(/^\//, '')}`;
      const res = await checkUrl(fullUrl);

      const isPadel = padelExerciseIds.has(ex.id);
      if (res.ok) {
        if (isPadel) padel200.push(ex);
      } else {
        if (isPadel) padel404.push({ ex, status: res.status, url: fullUrl });
        else other404.push({ ex, status: res.status, url: fullUrl });
      }
    }));
  }

  console.log(`📊 PADEL PLAN EXERCISES RESULTS:`);
  console.log(`  ✅ Padel Videos 200 OK: ${padel200.length}`);
  console.log(`  ❌ Padel Videos 404/Fail: ${padel404.length}`);
  console.log(`  ℹ️ Non-Padel Videos 404/Fail: ${other404.length}\n`);

  if (padel404.length > 0) {
    console.log(`🚨 Padel Plan 404 Videos List:`);
    padel404.forEach(item => {
      console.log(`  - [${item.ex.slug}] "${item.ex.name_es}" -> ${item.url}`);
    });
  }
}

main().catch(console.error);
