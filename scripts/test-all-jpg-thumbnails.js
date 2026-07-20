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
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, contentType: res.headers['content-type'] });
    });
    req.on('error', () => resolve({ status: 500, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408, ok: false }); });
    req.end();
  });
}

async function main() {
  const { data: exercises } = await supabase.from('exercises').select('id, slug, video_url, thumbnail_url');

  console.log(`Checking JPG thumbnail existence for ${exercises.length} exercises...`);

  let jpgFound = 0;
  let jpgMissing = 0;

  for (let i = 0; i < exercises.length; i += 15) {
    const batch = exercises.slice(i, i + 15);
    await Promise.all(batch.map(async (ex) => {
      const videoName = ex.video_url || `${ex.slug}.mp4`;
      const baseName = videoName.replace(/\.mp4$/i, '').replace(/^\//, '');
      const jpgUrl = `${CDN_BASE}/${baseName}.jpg`;

      const res = await checkUrl(jpgUrl);
      if (res.ok && res.contentType && res.contentType.includes('image')) {
        jpgFound++;
      } else {
        jpgMissing++;
      }
    }));
  }

  console.log(`\n📊 Real JPG Image Test Results on Bunny CDN:`);
  console.log(`  🖼️ Real JPG Images Found (200 OK): ${jpgFound}`);
  console.log(`  ❌ Missing JPG Images (404): ${jpgMissing}`);
}

main();
