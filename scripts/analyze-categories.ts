import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as xlsx from 'xlsx';

const envFile = fs.readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const excelPath = "C:\\Users\\59892\\Desktop\\tickets front vteamfit\\PLAN EJERCICIOS (5).xlsx";

function normalize(str: string) {
  if (!str) return '';
  return str.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Very simple Levenshtein implementation
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

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
  
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Let's find out which columns contain "ejercicio" and "categoria"
  if (rows.length === 0) return;
  const headers = rows[0].map((h: any) => normalize(h));
  console.log('Headers:', headers);

  // We assume there's a column for "ejercicio" and a column for "categoria" or "zona" or "grupo muscular"
  let ejIdx = headers.findIndex((h: string) => h.includes('ejercicio') || h.includes('nombre'));
  let catIdx = headers.findIndex((h: string) => h.includes('categoria') || h.includes('musculo') || h.includes('zona'));
  
  // If not found, let's just log first few rows
  console.log('Detected Ejercicio index:', ejIdx);
  console.log('Detected Categoria index:', catIdx);
  
  if (ejIdx === -1 || catIdx === -1) {
     console.log('Could not find standard headers, first 3 rows:', rows.slice(0, 3));
     // Let's just blindly use column 0 and 1 or whatever is available, maybe wait for inspection.
     return;
  }

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

  // Load from DB
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
    
    // Find best match in Excel
    let bestMatch = null;
    let minDistance = Infinity;
    
    // exact match first
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

    // Levenshtein fuzzy match
    for (const exEx of excelExercises) {
        const dist = levenshteinDistance(dbNorm, exEx.normName);
        if (dist < minDistance) {
            minDistance = dist;
            bestMatch = exEx;
        }
    }
    
    // threshold: if string is long, allow more distance. Let's say max 4 edits.
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
  
  console.log('\n--- MATCHES PREVIEW ---');
  console.log(`Total matched: ${matches.length}`);
  console.log(matches.slice(0, 5));
  
  console.log('\n--- UNMATCHED PREVIEW ---');
  console.log(`Total unmatched: ${missing.length}`);
  console.log(missing.slice(0, 10));

  fs.writeFileSync('category-sync-report.json', JSON.stringify({ matches, missing }, null, 2));
  console.log('\nFull report dumped to category-sync-report.json');
}

main();
