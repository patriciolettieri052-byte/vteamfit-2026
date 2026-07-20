const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const BUNNY_CDN_BASE = env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://vteamfitjuly2026.b-cdn.net';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateThumbnails() {
  console.log('🔄 Fetching exercises to update thumbnails...');
  
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, slug, video_url');

  if (error) {
    console.error('❌ Error fetching exercises:', error);
    return;
  }

  console.log(`📦 Found ${exercises.length} exercises. Updating...`);

  const updates = exercises.map(ex => {
    // If video_url is already a full URL, use it. If not, use bunny base.
    const videoFile = ex.video_url.startsWith('http') 
        ? ex.video_url 
        : `${BUNNY_CDN_BASE}/${ex.video_url}`;
    
    // Ensure we don't have double ?thumbnail=1
    const cleanUrl = videoFile.split('?')[0];
    const newThumbnailUrl = `${cleanUrl}?thumbnail=1`;

    return {
      id: ex.id,
      thumbnail_url: newThumbnailUrl
    };
  });

  for (const ex of updates) {
    const { error: updateError } = await supabase
      .from('exercises')
      .update({ thumbnail_url: ex.thumbnail_url })
      .eq('id', ex.id);

    if (updateError) {
      console.error(`❌ Error updating exercise ${ex.id}:`, updateError);
    }
  }

  console.log('✅ All thumbnails updated successfully to Bunny CDN!');
}

updateThumbnails();
