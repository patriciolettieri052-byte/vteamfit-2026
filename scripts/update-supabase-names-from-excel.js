const XLSX = require('xlsx');
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

const excelPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\REPAIR\\Plan Padel (1).xlsx';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

function fixExcelTypos(val) {
  if (!val) return '';
  let str = String(val).trim();

  // Strip category prefixes
  const prefixes = [
    'PECHO', 'TREN INFERIOR', 'ESPALDA', 'ESPALADA', 'TRÍCEPS', 'TRICEPS', 
    'BÍCEPS', 'BICEPS', 'HOMBROS', 'ANTEBRAZO', 'CARDIO', 'CINTURA'
  ];

  for (const prefix of prefixes) {
    if (str.toUpperCase().startsWith(prefix + ' ')) {
      str = str.substring(prefix.length).trim();
      break;
    }
  }

  // Fix typos
  str = str
    .replace(/PIERNSA/gi, 'PIERNAS')
    .replace(/ESQUILIBRIO/gi, 'EQUILIBRIO')
    .replace(/GOLDE/gi, 'GOLPE')
    .replace(/DERCHA/gi, 'DERECHA')
    .replace(/DEDERECHA/gi, 'DERECHA')
    .replace(/DESPLAZAMINETOS/gi, 'DESPLAZAMIENTOS')
    .replace(/PESS/gi, 'PRESS')
    .replace(/FORTALER/gi, 'FORTALECER')
    .replace(/MAQUIANA/gi, 'MÁQUINA')
    .replace(/PERNA/gi, 'PIERNA')
    .replace(/SENTANDOTE/gi, 'SENTÁNDOTE')
    .replace(/\s+/g, ' ')
    .trim();

  return str;
}

function toTitleCase(str) {
  if (!str) return '';
  const lowerWords = ['de', 'del', 'y', 'e', 'o', 'u', 'a', 'al', 'con', 'en', 'por', 'para', 'sin', 'o'];
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (!word) return '';
      if (word.match(/^(i|ii|iii|iv|v|vi|vii|viii|ix|x)$/i)) return word.toUpperCase();
      if (index > 0 && lowerWords.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function isVideoCode(val) {
  if (!val) return false;
  const s = String(val).trim().toUpperCase();
  if (/^D\d+\//.test(s)) return true;
  if (/^DÍA\s*\d+\//.test(s)) return true;
  if (/^TG\s*YO/.test(s)) return true;
  if (/^TG\//.test(s)) return true;
  if (/^N\d+$/.test(s)) return true;
  return false;
}

async function main() {
  console.log('1. Querying Supabase for plan-padel exercises...');
  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'plan-padel').single();
  const { data: weeks } = await supabase.from('weeks').select('id, week_number').eq('plan_id', plan.id).order('week_number', { ascending: true });

  const supabaseSchedule = new Map();

  for (const week of weeks) {
    const { data: days } = await supabase.from('days').select('id, day_number, title, is_rest_day').eq('week_id', week.id).order('day_number', { ascending: true });
    for (const day of days) {
      if (!day.is_rest_day) {
        const { data: rels } = await supabase.from('day_exercises').select('position, exercise:exercises(id, slug, name_es, video_url)').eq('day_id', day.id).order('position', { ascending: true });
        supabaseSchedule.set(`W${week.week_number}_D${day.day_number}`, rels);
      }
    }
  }

  console.log('2. Matching clean Excel exercise names to Supabase exercises...');

  let currentWeekNum = 0;
  const dayNames = ['LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'SÁBADO', 'DOMINGO'];
  let currentDayNumInWeek = 0;

  const updatesMap = new Map(); // exercise_id -> new_name_es

  for (let rowIndex = 0; rowIndex < rawRows.length; rowIndex++) {
    const row = rawRows[rowIndex];
    if (!row || row.length === 0) continue;

    for (const cell of row) {
      if (!cell) continue;
      const strCell = String(cell).trim().toUpperCase();
      const m = strCell.match(/SEMANA\s*(\d+)/i);
      if (m) {
        currentWeekNum = parseInt(m[1], 10);
        currentDayNumInWeek = 0;
        break;
      }
    }

    let matchedDayName = null;
    let dayCellIndex = -1;
    for (let c = 0; c < row.length; c++) {
      const cellVal = String(row[c] || '').trim().toUpperCase();
      const found = dayNames.find(d => cellVal === d || cellVal.startsWith(d + ' '));
      if (found) {
        matchedDayName = found;
        dayCellIndex = c;
        break;
      }
    }

    if (matchedDayName && currentWeekNum > 0) {
      currentDayNumInWeek++;
      if (matchedDayName.startsWith('DOMINGO')) continue;

      const globalDayNum = (currentWeekNum - 1) * 7 + currentDayNumInWeek;
      const key = `W${currentWeekNum}_D${globalDayNum}`;
      const dayRels = supabaseSchedule.get(key) || [];

      // Extract raw exercises from Excel
      const rawExcelExercises = [];
      for (let c = dayCellIndex + 1; c < row.length; c++) {
        const val = String(row[c] || '').trim();
        if (!val) continue;
        if (isVideoCode(val)) continue;
        if (val.toUpperCase().startsWith('CALENTAMIENTO')) continue;
        if (val.toUpperCase() === 'CARDIO') continue;
        rawExcelExercises.push(val);
      }

      // Filter out auto-injected Pos 0 Calentamiento, Pos 1 ABD, and last Estiramiento
      const coreDayRels = dayRels.filter(r => 
        r.exercise?.name_es !== 'Calentamiento Pre-Partido' && 
        !r.exercise?.name_es?.startsWith('Circuito') && 
        r.exercise?.name_es !== 'Estiramiento'
      );

      for (let i = 0; i < Math.min(rawExcelExercises.length, coreDayRels.length); i++) {
        const rawExcelEx = rawExcelExercises[i];
        const fixedName = fixExcelTypos(rawExcelEx);
        const titleCaseName = toTitleCase(fixedName);
        const exObj = coreDayRels[i]?.exercise;

        if (exObj && exObj.id && titleCaseName) {
          updatesMap.set(exObj.id, { id: exObj.id, slug: exObj.slug, newName: titleCaseName, oldName: exObj.name_es, videoUrl: exObj.video_url });
        }
      }
    }
  }

  console.log(`3. Updating ${updatesMap.size} exercise names in Supabase (video_url UNTOUCHED)...`);

  let updatedCount = 0;
  for (const [exId, info] of updatesMap) {
    if (info.newName !== info.oldName) {
      const { error } = await supabase
        .from('exercises')
        .update({ name_es: info.newName })
        .eq('id', exId);

      if (error) {
        console.error(`Error updating exercise ${exId} (${info.slug}):`, error);
      } else {
        updatedCount++;
      }
    }
  }

  console.log(`  ✓ Updated ${updatedCount} exercise names in Supabase DB.`);

  console.log('4. Synchronizing VTEAMFIT_MASTER.json with new exercise names...');
  const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
  if (fs.existsSync(masterPath)) {
    const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
    let masterUpdatedCount = 0;

    for (const planKey in master) {
      const p = master[planKey];
      if (p.exercises) {
        p.exercises.forEach(ex => {
          for (const [exId, info] of updatesMap) {
            if (ex.slug === info.slug) {
              if (ex.name_es !== info.newName) {
                ex.name_es = info.newName;
                masterUpdatedCount++;
              }
            }
          }
        });
      }
    }

    fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
    console.log(`  ✓ Updated ${masterUpdatedCount} exercise names in VTEAMFIT_MASTER.json.`);
  }

  console.log('\n✨ Exercise names update complete! All Bunny CDN video URLs remained 100% intact.');
}

main().catch(console.error);
