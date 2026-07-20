const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: exercises } = await supabase.from('exercises').select('id, slug, name_es, video_url, thumbnail_url');

  let mp4Thumbs = 0;
  let jpgThumbs = 0;
  let otherThumbs = 0;

  exercises.forEach(ex => {
    if (!ex.thumbnail_url) {
      otherThumbs++;
    } else if (ex.thumbnail_url.includes('.mp4')) {
      mp4Thumbs++;
    } else if (ex.thumbnail_url.endsWith('.jpg') || ex.thumbnail_url.endsWith('.png')) {
      jpgThumbs++;
    } else {
      otherThumbs++;
    }
  });

  console.log(`📊 Thumbnail Types in Supabase:`);
  console.log(`  🎥 MP4 Video URLs (Broken in <img> tags): ${mp4Thumbs}`);
  console.log(`  🖼️ Real JPG/PNG Image URLs: ${jpgThumbs}`);
  console.log(`  ❓ Empty or Other: ${otherThumbs}`);
}

main();
