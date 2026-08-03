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

const OLD_HOST = 'vteamfitjuly2026.b-cdn.net';
const NEW_HOST = 'vteamfitnessapp.b-cdn.net';

async function main() {
  console.log(`🔄 1. Updating VTEAMFIT_MASTER.json from ${OLD_HOST} to ${NEW_HOST}...`);
  const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
  if (fs.existsSync(masterPath)) {
    let content = fs.readFileSync(masterPath, 'utf8');
    const updatedContent = content.replaceAll(OLD_HOST, NEW_HOST);
    fs.writeFileSync(masterPath, updatedContent, 'utf8');
    console.log('✓ VTEAMFIT_MASTER.json updated.');
  } else {
    console.log('⚠️ VTEAMFIT_MASTER.json not found.');
  }

  console.log(`🔄 2. Updating Supabase DB exercises from ${OLD_HOST} to ${NEW_HOST}...`);
  const { data: exercises, error: fetchError } = await supabase
    .from('exercises')
    .select('id, video_url, thumbnail_url');

  if (fetchError) {
    console.error('Error fetching exercises:', fetchError);
    return;
  }

  console.log(`Found ${exercises.length} exercises. Checking for URL updates...`);
  let updatedCount = 0;

  for (const ex of exercises) {
    let updated = false;
    let video_url = ex.video_url;
    let thumbnail_url = ex.thumbnail_url;

    if (video_url && video_url.includes(OLD_HOST)) {
      video_url = video_url.replaceAll(OLD_HOST, NEW_HOST);
      updated = true;
    }
    if (thumbnail_url && thumbnail_url.includes(OLD_HOST)) {
      thumbnail_url = thumbnail_url.replaceAll(OLD_HOST, NEW_HOST);
      updated = true;
    }

    if (updated) {
      const { error: updateError } = await supabase
        .from('exercises')
        .update({ video_url, thumbnail_url })
        .eq('id', ex.id);

      if (updateError) {
        console.error(`Error updating exercise ID ${ex.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`✓ Updated ${updatedCount} exercises in Supabase.`);

  console.log('🔄 3. Updating .env.local file...');
  const updatedEnv = envFile.replace(OLD_HOST, NEW_HOST);
  fs.writeFileSync('.env.local', updatedEnv, 'utf8');
  console.log('✓ .env.local updated.');

  console.log('✨ All CDN url updates completed successfully!');
}

main().catch(console.error);
