const fs = require('fs');
const path = require('path');

const MASTER_PATH = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');

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
  const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));

  let updatedCount = 0;
  for (const planKey in master) {
    const plan = master[planKey];
    if (plan.exercises) {
      plan.exercises.forEach(ex => {
        if (ex.categoria === 'padel') {
          ex.categoria = 'activación';
          updatedCount++;
        }
      });
    }
  }

  fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));
  console.log(`  ✓ Updated ${updatedCount} exercise entries in VTEAMFIT_MASTER.json from 'padel' to 'activación'.`);

  console.log('\n2. Updating Supabase database directly...');
  const { data: updatedSupabase, error: subErr } = await supabase
    .from('exercises')
    .update({ categoria: 'activación' })
    .eq('categoria', 'padel')
    .select('id, slug');

  if (subErr) {
    console.error('Error updating Supabase:', subErr);
  } else {
    console.log(`  ✓ Updated ${updatedSupabase ? updatedSupabase.length : 0} rows in Supabase 'exercises' table to 'activación'.`);
  }

  console.log('\n✨ Category update complete!');
}

main().catch(console.error);
