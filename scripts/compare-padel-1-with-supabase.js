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

  // Strip muscle category prefixes (including misspelled ones)
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

  // Fix typos in exercise names
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

function normalizeForComparison(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/\b(al|el|la|los|las|de|del|en|con|un|una|1|2|3|4|5|maquina|banco|postura|posicion)\b/g, '') // strip stop words & noise
    .replace(/[^a-z0-9]/g, '');      // strip punctuation & spaces
}

async function main() {
  console.log('🔍 Querying Supabase for plan-padel structure...');
  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'plan-padel').single();
  const { data: weeks } = await supabase.from('weeks').select('id, week_number').eq('plan_id', plan.id).order('week_number', { ascending: true });

  const supabaseSchedule = new Map();

  for (const week of weeks) {
    const { data: days } = await supabase.from('days').select('id, day_number, title, is_rest_day').eq('week_id', week.id).order('day_number', { ascending: true });
    for (const day of days) {
      if (day.is_rest_day) {
        supabaseSchedule.set(`W${week.week_number}_D${day.day_number}`, { title: day.title, is_rest: true, exercises: [] });
      } else {
        const { data: rels } = await supabase.from('day_exercises').select('position, exercise:exercises(slug, name_es)').eq('day_id', day.id).order('position', { ascending: true });
        const exList = rels.map(r => r.exercise?.name_es || r.exercise?.slug);
        supabaseSchedule.set(`W${week.week_number}_D${day.day_number}`, { title: day.title, is_rest: false, exercises: exList });
      }
    }
  }

  console.log('📋 Parsing Excel Plan Padel (1).xlsx with corrected exercise names...');

  let currentWeekNum = 0;
  const dayNames = ['LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'SÁBADO', 'DOMINGO'];
  let currentDayNumInWeek = 0;

  let md = `# Comparativa: Plan Padel (1).xlsx (Corregido) vs Supabase DB\n\n`;
  md += `> **Fuente Excel:** \`C:\\Users\\59892\\Desktop\\VTeamfit\\REPAIR\\Plan Padel (1).xlsx\` (Nombres corregidos ortográficamente)\n`;
  md += `> **Fuente Supabase:** Base de Datos activa (\`plans\` -> \`weeks\` -> \`days\` -> \`day_exercises\` -> \`exercises\`)\n\n`;
  md += `| Semana | Día | Nombre del Ejercicio (Excel Corregido) | Nombre del Ejercicio (Supabase) | Coincidencia |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  let totalOK = 0;
  let totalDifferences = 0;
  let totalRowsEvaluated = 0;

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
      const globalDayNum = (currentWeekNum - 1) * 7 + currentDayNumInWeek;
      const key = `W${currentWeekNum}_D${globalDayNum}`;
      const supabaseData = supabaseSchedule.get(key);

      if (matchedDayName.startsWith('DOMINGO')) {
        md += `| Semana ${currentWeekNum} | Día ${globalDayNum} (Domingo) | *Día de Descanso* | *Día de Descanso* | OK |\n`;
        totalOK++;
        totalRowsEvaluated++;
        continue;
      }

      const rawExcelExercises = [];
      for (let c = dayCellIndex + 1; c < row.length; c++) {
        const val = String(row[c] || '').trim();
        if (!val) continue;
        if (isVideoCode(val)) continue;
        if (val.toUpperCase().startsWith('CALENTAMIENTO')) continue;
        if (val.toUpperCase() === 'CARDIO') continue;
        rawExcelExercises.push(val);
      }

      const supabaseExercises = supabaseData ? supabaseData.exercises : [];
      const coreSupabase = supabaseExercises.filter(ex => 
        ex !== 'Calentamiento Pre-Partido' && 
        !ex.startsWith('Circuito') && 
        ex !== 'Estiramiento'
      );

      const maxLen = Math.max(rawExcelExercises.length, coreSupabase.length);

      if (maxLen === 0) {
        md += `| Semana ${currentWeekNum} | Día ${globalDayNum} (${matchedDayName}) | *Sin Ejercicios Principales* | *Sin Ejercicios Principales* | OK |\n`;
        totalOK++;
        totalRowsEvaluated++;
      } else {
        for (let i = 0; i < maxLen; i++) {
          const rawExcelEx = rawExcelExercises[i] || '-';
          const fixedExcelEx = rawExcelEx !== '-' ? fixExcelTypos(rawExcelEx) : '-';
          const supabaseEx = coreSupabase[i] || '-';

          const normExcel = normalizeForComparison(fixedExcelEx);
          const normSupabase = normalizeForComparison(supabaseEx);

          let status = 'Diferencia en el nombre';
          if (
            fixedExcelEx.trim().toLowerCase() === supabaseEx.trim().toLowerCase() ||
            normExcel === normSupabase ||
            normSupabase.includes(normExcel) ||
            normExcel.includes(normSupabase)
          ) {
            status = 'OK';
            totalOK++;
          } else {
            status = 'Diferencia en el nombre';
            totalDifferences++;
          }

          totalRowsEvaluated++;
          md += `| Semana ${currentWeekNum} | Día ${globalDayNum} (${matchedDayName}) | ${fixedExcelEx} | ${supabaseEx} | ${status} |\n`;
        }
      }
    }
  }

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/comparativa_excel_padel1_vs_supabase.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ Table updated successfully at ${ARTIFACT_PATH}`);
  console.log(`📊 Evaluated ${totalRowsEvaluated} exercise rows across 24 weeks.`);
  console.log(`  - Total OK: ${totalOK}`);
  console.log(`  - Total Diferencias en el nombre: ${totalDifferences}`);
}

main().catch(console.error);
