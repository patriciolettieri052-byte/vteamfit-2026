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
  console.log('🔍 Querying Supabase for plan-padel exercises...');
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

  let currentWeekNum = 0;
  const dayNames = ['LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'SÁBADO', 'DOMINGO'];
  let currentDayNumInWeek = 0;

  const exerciseMap = new Map(); // slug -> { slug, oldName, newName, rawExcelName, videoUrl }

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

      const rawExcelExercises = [];
      for (let c = dayCellIndex + 1; c < row.length; c++) {
        const val = String(row[c] || '').trim();
        if (!val) continue;
        if (isVideoCode(val)) continue;
        if (val.toUpperCase().startsWith('CALENTAMIENTO')) continue;
        if (val.toUpperCase() === 'CARDIO') continue;
        rawExcelExercises.push(val);
      }

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

        if (exObj && exObj.slug) {
          if (!exerciseMap.has(exObj.slug)) {
            let oldNameFormatted = rawExcelEx.trim().toUpperCase();
            exerciseMap.set(exObj.slug, {
              slug: exObj.slug,
              oldName: oldNameFormatted,
              newName: exObj.name_es || titleCaseName,
              rawExcelName: rawExcelEx,
              videoUrl: exObj.video_url || `${exObj.slug}.mp4`
            });
          }
        }
      }
    }
  }

  // Also query all unique exercises from Supabase to ensure 100% coverage
  const { data: allSupabaseExercises } = await supabase.from('exercises').select('slug, name_es, video_url');
  
  allSupabaseExercises.forEach(ex => {
    if (!exerciseMap.has(ex.slug)) {
      exerciseMap.set(ex.slug, {
        slug: ex.slug,
        oldName: ex.name_es.toUpperCase(),
        newName: ex.name_es,
        rawExcelName: ex.name_es,
        videoUrl: ex.video_url
      });
    }
  });

  let md = `# Tabla de Actualización de Nombres de Ejercicios (5 Columnas)\n\n`;
  md += `> **Estructura solicitada:** \`Slug del Ejercicio\` | \`Nombre Anterior (Supabase)\` | \`Nombre Nuevo Actualizado (name_es)\` | \`Nombres en Excel Plan Padel (1).xlsx\` | \`Video URL (Intacto)\`\n\n`;
  md += `| Slug del Ejercicio | Nombre Anterior (Supabase) | Nombre Nuevo Actualizado (\`name_es\`) | Nombres en Excel (\`Plan Padel (1).xlsx\`) | Video URL (Intacto) |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  let count = 0;
  const sortedSlugs = Array.from(exerciseMap.keys()).sort();

  sortedSlugs.forEach(slug => {
    const item = exerciseMap.get(slug);
    const fullVideoUrl = item.videoUrl.startsWith('http') ? item.videoUrl : `https://vteamfitjuly2026.b-cdn.net/${item.videoUrl}`;
    const rawExcelNameDisplay = item.rawExcelName || item.oldName || item.newName;
    md += `| \`${item.slug}\` | ${item.oldName} | **${item.newName}** | *${rawExcelNameDisplay}* | [\`${item.videoUrl}\`](${fullVideoUrl}) |\n`;
    count++;
  });

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/tabla_actualizacion_nombres_ejercicios.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ 5-column Table generated successfully at ${ARTIFACT_PATH}`);
  console.log(`📊 Total unique exercises logged: ${count}`);
}

main().catch(console.error);
