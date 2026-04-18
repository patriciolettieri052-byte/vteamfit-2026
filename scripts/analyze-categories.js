const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const xlsx = require('xlsx');

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

const excelPath = "C:\\Users\\59892\\Desktop\\tickets front vteamfit\\PLAN EJERCICIOS (5).xlsx";

function normalize(str) {
  if (!str) return '';
  return str.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function levenshteinDistance(s1, s2) {
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
  console.log('Reading Excel...', excelPath);
  let workbook;
  try {
    workbook = xlsx.readFile(excelPath);
  } catch (e) {
    console.error('Error reading excel file:', e);
    return;
  }
  
  let targetSheet = null;
  let rows = [];
  let ejIdx = -1;
  let catIdx = -1;
  let headers = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const sheetRows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Find header row (might not be row 0)
    for (let r = 0; r < Math.min(sheetRows.length, 10); r++) {
      if (!sheetRows[r]) continue;
      const rowHeaders = sheetRows[r].map(h => normalize(h));
      
      let eIdx = -1;
      let cIdx = -1;
      for (let i = 0; i < rowHeaders.length; i++) {
        const h = rowHeaders[i] || '';
        if (typeof h.includes === 'function') {
          if (h.includes('ejercicio') || h.includes('nombre')) eIdx = i;
          if (h.includes('categoria') || h.includes('musculo') || h.includes('zona') || h.includes('grupo muscul')) cIdx = i;
        }
      }
      
      if (eIdx !== -1 && cIdx !== -1) {
         targetSheet = sheetName;
         rows = sheetRows.slice(r); // start from header row
         headers = rowHeaders;
         ejIdx = eIdx;
         catIdx = cIdx;
         break;
      }
    }
    if (targetSheet) break;
  }
  
  if (!targetSheet) {
     console.log('Could not find standard headers in any sheet.');
     // Debug: print first row of all sheets
     for (const sn of workbook.SheetNames) {
        console.log(`Sheet ${sn} row 0:`, xlsx.utils.sheet_to_json(workbook.Sheets[sn], { header: 1 })[0]);
     }
     return;
  }

  console.log(`Found headers in sheet "${targetSheet}"!`);


  const excelExercises = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][ejIdx] && rows[i][catIdx]) {
      excelExercises.push({
        origName: rows[i][ejIdx],
        normName: normalize(rows[i][ejIdx]),
        categoria: rows[i][catIdx]
      });
    }
  }
  
  console.log(`Parsed ${excelExercises.length} valid rows from Excel.`);

  const { data: dbExercises, error } = await supabase.from('exercises').select('id, slug, name_es, categoria');
  if (error || !dbExercises) {
    console.error('Database error:', error);
    return;
  }

  console.log(`Loaded ${dbExercises.length} exercises from database.`);
  
  const matches = [];
  const missing = [];
  
  for (const dbEx of dbExercises) {
    const dbNorm = normalize(dbEx.name_es);
    
    let bestMatch = null;
    let minDistance = Infinity;
    
    let match = excelExercises.find(e => e.normName === dbNorm);
    
    if (match) {
        matches.push({
            id: dbEx.id,
            name: dbEx.name_es,
            excelName: match.origName,
            oldCat: dbEx.categoria,
            newCat: match.categoria
        });
        continue;
    }

    for (const exEx of excelExercises) {
        const dist = levenshteinDistance(dbNorm, exEx.normName);
        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = exEx;
        }
    }
    
    if (bestMatch && minDistance <= 4) {
         matches.push({
            id: dbEx.id,
            name: dbEx.name_es,
            excelName: bestMatch.origName,
            oldCat: dbEx.categoria,
            newCat: bestMatch.categoria,
            distance: minDistance
        });
    } else {
        missing.push({
            name: dbEx.name_es,
            bestCandidate: bestMatch ? bestMatch.origName : 'none',
            distance: minDistance
        });
    }
  }
  
  console.log('\n--- STATISTICS ---');
  console.log(`Total DB exercises: ${dbExercises.length}`);
  console.log(`Successfully matched: ${matches.length}`);
  console.log(`Missing/Unmatched: ${missing.length}`);
  
  fs.writeFileSync('category-sync-report.json', JSON.stringify({ matches, missing }, null, 2));
  console.log('\nFull report dumped to category-sync-report.json');
}

main();
