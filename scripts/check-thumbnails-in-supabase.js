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
  const { data: exercises } = await supabase
    .from('exercises')
    .select('slug, name_es, video_url, thumbnail_url')
    .in('slug', ['calentamiento-pre-partido', 'defensa-lateral', 'volea-derecha-reves']);

  console.log('Exercises in Supabase:', exercises);
}

main();
