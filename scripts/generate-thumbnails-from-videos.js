const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const folder = 'C:\\Users\\59892\\Desktop\\VTeamfit\\videos calentamiento';

const mapping = [
  { video: 'activacion padel.mp4', slug: 'calentamiento-pre-partido', jpgName: 'activacion-padel.jpg' },
  { video: 'calentamiento general_vteamfit-1.mp4', slug: 'calentamiento-general', jpgName: 'calentamiento-general.jpg' },
  { video: 'circuito 1 abdominales.mp4', slug: 'circuito-1-abdominales', jpgName: 'circuito-1-abdominales.jpg' },
  { video: 'circuito 2 abdominales.mp4', slug: 'circuito-2-abdominales', jpgName: 'circuito-2-abdominales.jpg' },
  { video: 'circuito 3 abdominales.mp4', slug: 'circuito-3-abdominales', jpgName: 'circuito-3-abdominales.jpg' },
  { video: 'circuito 4 abdominales-1.mp4', slug: 'circuito-4-abdominales', jpgName: 'circuito-4-abdominales.jpg' },
  { video: 'circuito 5 abdominales.mp4', slug: 'circuito-5-abdominales', jpgName: 'circuito-5-abdominales.jpg' },
  { video: 'estiramiento_vteamfit.mp4', slug: 'estiramiento', jpgName: 'estiramiento.jpg' }
];

async function main() {
  console.log('🎬 Generating thumbnails using FFmpeg...\n');

  for (const item of mapping) {
    const videoPath = path.join(folder, item.video);
    const jpgPath = path.join(folder, item.jpgName);

    if (fs.existsSync(videoPath)) {
      console.log(`📸 Extracting frame from "${item.video}" ➡️ "${item.jpgName}"...`);
      const cmd = `ffmpeg -y -ss 00:00:03 -i "${videoPath}" -vframes 1 -q:v 2 "${jpgPath}"`;
      try {
        execSync(cmd, { stdio: 'pipe' });
        console.log(`  ✓ Saved thumbnail: ${jpgPath}`);
      } catch (err) {
        console.error(`  ❌ Error extracting frame for ${item.video}:`, err.message);
      }
    } else {
      console.warn(`  ⚠️ Video not found: ${videoPath}`);
    }
  }

  console.log('\n🔄 Updating Supabase DB thumbnail_url for these exercises...');

  for (const item of mapping) {
    const { data: ex } = await supabase.from('exercises').select('id, name_es, thumbnail_url').eq('slug', item.slug).single();
    if (ex) {
      const cdnUrl = `https://vteamfitjuly2026.b-cdn.net/${item.jpgName}`;
      const { error } = await supabase.from('exercises').update({ thumbnail_url: cdnUrl }).eq('id', ex.id);
      if (error) {
        console.error(`Error updating Supabase for ${item.slug}:`, error);
      } else {
        console.log(`  ✓ Updated Supabase [${item.slug}]: thumbnail_url = "${cdnUrl}"`);
      }
    }
  }

  console.log('\n✨ Thumbnail generation & Supabase linking complete!');
  console.log(`📁 All .jpg files are saved in: ${folder}`);
}

main().catch(console.error);
