const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
const supabase = createClient(supabaseUrl, supabaseKey);

function normalize(str) {
  if (!str) return '';
  return str.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function levenshteinDistance(s1, s2) {
  if (!s1 || !s2) return 999;
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[len1][len2];
}

async function main() {
  const isWetRun = process.argv.includes('--wet-run');

  const rows = JSON.parse(fs.readFileSync('excel_dump.json', 'utf8'));
  let currentCategory = 'GENERAL';
  const excelExercises = [];

  for (const row of rows) {
    let rawStr = '';
    
    // Look for category headers anywhere in the row
    for(const cell of row) {
        if(typeof cell === 'string') {
            const up = cell.toUpperCase();
            if(up.includes('EJERCICIO HOMBROS')) { currentCategory = 'HOMBROS'; break; }
            if(up.includes('EJERCICIOS DE PECHO')) { currentCategory = 'PECHO'; break; }
            if(up.includes('EJERCICIOS TRÍCEPS')) { currentCategory = 'TRÍCEPS'; break; }
            if(up.includes('EJERCICIOS BÍCEPS')) { currentCategory = 'BÍCEPS'; break; }
            if(up.includes('EJERCICIOS ANTEBRAZO')) { currentCategory = 'ANTEBRAZO'; break; }
            if(up.includes('EJERCICIOS ESPALADA')) { currentCategory = 'ESPALDA'; break; } // Fixing typo
            if(up.includes('EJERCICIOS CINTURA')) { currentCategory = 'CINTURA/CORE'; break; }
            if(up.includes('EJERCICIOS GLUTEOS - TREN INFERIOR')) { currentCategory = 'TREN INFERIOR'; break; }
        }
    }

    // Now look for the exercise name
    // Looking at the dump, exercises and names are usually at index 3.
    let exName = row[3];
    if (typeof exName === 'string') {
        const norm = normalize(exName);
        if(norm.length > 5 && !norm.includes('ejercicio') && !norm.includes('repetici')) {
             excelExercises.push({
                 origName: exName,
                 normName: norm,
                 category: currentCategory
             });
        }
    }
  }

  const { data: dbExercises, error } = await supabase.from('exercises').select('id, slug, name_es, categoria');
  if (error || !dbExercises) {
    console.error('Database error:', error);
    return;
  }

  const updates = [];
  const missing = [];
  
  for (const dbEx of dbExercises) {
    const dbNorm = normalize(dbEx.name_es);
    let bestMatch = null;
    let minDistance = Infinity;

    // Direct subset matching
    let match = excelExercises.find(e => e.normName === dbNorm || dbNorm.includes(e.normName) || e.normName.includes(dbNorm));
    
    if (!match) {
        for (const exEx of excelExercises) {
            const dist = levenshteinDistance(dbNorm, exEx.normName);
            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = exEx;
            }
        }
    }

    if (match) {
        if(dbEx.categoria !== match.category) {
            updates.push({ id: dbEx.id, old: dbEx.categoria, new: match.category, dbName: dbEx.name_es });
        }
    } else if (bestMatch && minDistance <= 8) { // allow a bit more fuzziness
        if(dbEx.categoria !== bestMatch.category) {
            updates.push({ id: dbEx.id, old: dbEx.categoria, new: bestMatch.category, dbName: dbEx.name_es });
        }
    } else {
        missing.push({ name: dbEx.name_es, id: dbEx.id, old: dbEx.categoria });
    }
  }

  // Phase 2: Inference for missing
  const trueMissing = [];
  function inferCategory(name) {
      const lower = name.toLowerCase();
      // Padel
      if(lower.match(/derecha|reves|revés|bandeja|vibora|víbora|saque|volea|golpe|padel|desplazamient|cinta caminando|cinta corriendo/)) return 'ENTRENAMIENTO DE PADEL';
      
      // Muscular
      if(lower.match(/biceps|bíceps/)) return 'BÍCEPS';
      if(lower.match(/triceps|tríceps/)) return 'TRÍCEPS';
      if(lower.match(/hombro|trapecio|cuello/)) return 'HOMBROS';
      if(lower.match(/espalda|dorsal|lumbar|remo|dominada/)) return 'ESPALDA';
      if(lower.match(/pecho|pectoral|apertura|lagartija|flexiones/)) return 'PECHO';
      if(lower.match(/cuadriceps|cuádriceps|gluteo|glúteo|isquio|abductor|gemelo|sentadilla|estocada|hip thrust|pierna|escalera|pantorrilla|cajón|cajon|step|gusano/)) return 'TREN INFERIOR';
      
      return null;
  }

  for(const miss of missing) {
      const inferred = inferCategory(miss.name);
      if(inferred) {
          if(miss.old !== inferred) {
              updates.push({ id: miss.id, old: miss.old, new: inferred, dbName: miss.name });
          }
      } else {
          trueMissing.push(miss);
      }
  }

  console.log(`Matched (Excel+Inference) and need update: ${updates.length}`);
  console.log(`Still unmatched exercises in DB: ${trueMissing.length}`);
  
  if (isWetRun && updates.length > 0) {
      console.log('UPDATING DB...');
      for(const u of updates) {
          await supabase.from('exercises').update({ categoria: u.new, categoria_en: u.new }).eq('id', u.id);
      }
      console.log('Update complete.');
      fs.writeFileSync('missing_exercises.json', JSON.stringify(trueMissing, null, 2));
  } else {
      console.log('DRY RUN PREVIEW (Updates):');
      console.log(updates.slice(0, 10));
      fs.writeFileSync('dry_run_updates.json', JSON.stringify(updates, null, 2));
      fs.writeFileSync('missing_exercises.json', JSON.stringify(trueMissing, null, 2));
  }
}

main();
