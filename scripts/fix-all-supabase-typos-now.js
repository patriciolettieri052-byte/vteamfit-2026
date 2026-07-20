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

function fixName(val) {
  if (!val) return '';
  let str = String(val).trim();

  // Strip category prefixes if still present
  const prefixes = [
    'PECHO', 'TREN INFERIOR', 'ESPALDA', 'ESPALADA', 'TRÍCEPS', 'TRICEPS', 
    'BÍCEPS', 'BICEPS', 'HOMBROS', 'HOMROS', 'ANTEBRAZO', 'CARDIO', 'CINTURA'
  ];
  for (const prefix of prefixes) {
    if (str.toUpperCase().startsWith(prefix + ' ')) {
      str = str.substring(prefix.length).trim();
      break;
    }
  }

  // Exact word replacements & typo corrections
  str = str
    .replace(/\bActicacion\b/gi, 'Activación')
    .replace(/\bacticación\b/gi, 'activación')
    .replace(/\bacticacion\b/gi, 'activación')
    .replace(/\bCalentamienmto\b/gi, 'Calentamiento')
    .replace(/\bSaltón\b/gi, 'Salto')
    .replace(/\bLaterlaes\b/gi, 'Laterales')
    .replace(/\bMancuena\b/gi, 'Mancuerna')
    .replace(/\bTren Inferir\b/gi, 'Tren Inferior')
    .replace(/\bHomros\b/gi, 'Hombros')
    .replace(/\bSpreen\b/gi, 'Sprint')
    .replace(/\bReves\b/gi, 'Revés')
    .replace(/\bEstaticas\b/gi, 'Estáticas')
    .replace(/\bEstatica\b/gi, 'Estática')
    .replace(/\bAereas\b/gi, 'Aéreas')
    .replace(/\bCajon\b/gi, 'Cajón')
    .replace(/\bMaquiana\b/gi, 'Máquina')
    .replace(/\bMaquina\b/gi, 'Máquina')
    .replace(/\bPiernsa\b/gi, 'Piernas')
    .replace(/\bEsquilibrio\b/gi, 'Equilibrio')
    .replace(/\bAdutores\b/gi, 'Aductores')
    .replace(/\bGolde\b/gi, 'Golpe')
    .replace(/\bDercha\b/gi, 'Derecha')
    .replace(/\bDederecha\b/gi, 'Derecha')
    .replace(/\bDesplazaminetos\b/gi, 'Desplazamientos')
    .replace(/\bPess\b/gi, 'Press')
    .replace(/\bFortaler\b/gi, 'Fortalecer')
    .replace(/\bEspalada\b/gi, 'Espalda')
    .replace(/\bTriceps\b/gi, 'Tríceps')
    .replace(/\bBiceps\b/gi, 'Bíceps')
    .replace(/\bCuadriceps\b/gi, 'Cuádriceps')
    .replace(/\s+/g, ' ')
    .trim();

  return str;
}

async function main() {
  console.log('1. Querying all exercises from Supabase DB...');
  const { data: exercises, error } = await supabase.from('exercises').select('id, slug, name_es, video_url');
  if (error) throw error;

  console.log(`2. Auditing and fixing typos in ${exercises.length} exercises...`);

  let updatedCount = 0;
  for (const ex of exercises) {
    const fixed = fixName(ex.name_es);
    if (fixed !== ex.name_es) {
      const { error: upErr } = await supabase
        .from('exercises')
        .update({ name_es: fixed })
        .eq('id', ex.id);

      if (upErr) {
        console.error(`Error updating exercise ${ex.id} (${ex.slug}):`, upErr);
      } else {
        console.log(`  ✓ Updated [${ex.slug}]: "${ex.name_es}" ➡️ "${fixed}"`);
        updatedCount++;
      }
    }
  }

  console.log(`\n  ✓ Corrected ${updatedCount} exercise names in Supabase DB.`);

  console.log('\n3. Synchronizing VTEAMFIT_MASTER.json...');
  const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
  if (fs.existsSync(masterPath)) {
    const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    let masterCount = 0;

    for (const planKey in master) {
      const p = master[planKey];
      if (p.exercises) {
        p.exercises.forEach(ex => {
          const fixed = fixName(ex.name_es);
          if (fixed !== ex.name_es) {
            ex.name_es = fixed;
            masterCount++;
          }
        });
      }
    }

    fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
    console.log(`  ✓ Updated ${masterCount} exercise names in VTEAMFIT_MASTER.json.`);
  }

  console.log('\n✨ Typo fixes complete! All Bunny CDN video URLs remained 100% intact.');
}

main().catch(console.error);
