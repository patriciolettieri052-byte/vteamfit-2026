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

async function scan() {
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, slug, name_es, video_url')
    .order('name_es', { ascending: true });

  if (error) {
    console.error('Error fetching exercises:', error);
    return;
  }

  console.log(`🔍 Total exercises in Supabase: ${exercises.length}\n`);

  exercises.forEach(ex => {
    console.log(`[${ex.slug}] -> "${ex.name_es}"`);
  });
}

scan().catch(console.error);
