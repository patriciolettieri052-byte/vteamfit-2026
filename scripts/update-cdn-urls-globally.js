const fs = require('fs');
const path = require('path');

const OLD_URLS = [
  'https://vtemmfitpullzone.b-cdn.net',
  'https://vteamfitnessapp.b-cdn.net',
  'vtemmfitpullzone.b-cdn.net',
  'vteamfitnessapp.b-cdn.net'
];

const NEW_CDN_URL = 'https://vteamfitjuly2026.b-cdn.net';
const NEW_DOMAIN = 'vteamfitjuly2026.b-cdn.net';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('1. Updating VTEAMFIT_MASTER.json...');
  const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
  if (fs.existsSync(masterPath)) {
    let content = fs.readFileSync(masterPath, 'utf8');
    content = content.replace(/https:\/\/vtemmfitpullzone\.b-cdn\.net/g, NEW_CDN_URL);
    content = content.replace(/https:\/\/vteamfitnessapp\.b-cdn\.net/g, NEW_CDN_URL);
    fs.writeFileSync(masterPath, content);
    console.log('  ✓ VTEAMFIT_MASTER.json updated.');
  }

  console.log('\n2. Updating script files...');
  const scriptsToUpdate = [
    'scripts/build-padel-from-bible.js',
    'scripts/update-padel-circuits.js',
    'scripts/ingest.ts',
    'scripts/update-thumbnails.js',
    'loaded_exercises.json'
  ];

  scriptsToUpdate.forEach(relPath => {
    const fullPath = path.join(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/https:\/\/vtemmfitpullzone\.b-cdn\.net/g, NEW_CDN_URL);
      content = content.replace(/https:\/\/vteamfitnessapp\.b-cdn\.net/g, NEW_CDN_URL);
      fs.writeFileSync(fullPath, content);
      console.log(`  ✓ Updated ${relPath}`);
    }
  });

  console.log('\n3. Updating Supabase DB (exercises table)...');
  const { data: exercises, error: fetchErr } = await supabase.from('exercises').select('id, thumbnail_url, video_url');
  if (fetchErr) {
    console.error('Error fetching exercises from Supabase:', fetchErr);
  } else {
    let updatedCount = 0;
    for (const ex of exercises) {
      let updatedThumb = ex.thumbnail_url;
      let updatedVideo = ex.video_url;

      if (updatedThumb && (updatedThumb.includes('vtemmfitpullzone') || updatedThumb.includes('vteamfitnessapp'))) {
        updatedThumb = updatedThumb.replace(/https:\/\/[^\/]+/g, NEW_CDN_URL);
      }
      if (updatedVideo && (updatedVideo.includes('vtemmfitpullzone') || updatedVideo.includes('vteamfitnessapp'))) {
        updatedVideo = updatedVideo.replace(/https:\/\/[^\/]+/g, NEW_CDN_URL);
      }

      if (updatedThumb !== ex.thumbnail_url || updatedVideo !== ex.video_url) {
        await supabase.from('exercises').update({ thumbnail_url: updatedThumb, video_url: updatedVideo }).eq('id', ex.id);
        updatedCount++;
      }
    }
    console.log(`  ✓ Updated ${updatedCount} exercise rows in Supabase DB.`);
  }

  console.log('\n✨ Global CDN URL update completed successfully!');
}

main().catch(console.error);
