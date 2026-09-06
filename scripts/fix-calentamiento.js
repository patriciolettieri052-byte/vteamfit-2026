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

const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const padel = master['plan-padel'].exercises;

async function main() {
  const ex = padel.find(e => e.slug === 'calentamienmto');
  if (ex) {
    ex.video_url = 'activacion-con-barra.mp4';
  }

  await supabase
    .from('exercises')
    .update({ video_url: 'activacion-con-barra.mp4' })
    .eq('slug', 'calentamienmto');

  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log('✓ calentamienmto actualizado a activacion-con-barra.mp4');
}

main().catch(console.error);
