const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
// Create client with service role key to have full access
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Querying Supabase users / profiles...');
  
  // 1. Get user profiles
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*');
    
  if (error) {
    console.error('Error fetching user profiles:', error);
  } else {
    console.log('User profiles:', profiles);
  }
  
  // 2. Check if there are other schemas or configurations
  // Let's check plans
  const { data: plans } = await supabase.from('plans').select('*');
  console.log('Plans:', plans);
}

main().catch(console.error);
