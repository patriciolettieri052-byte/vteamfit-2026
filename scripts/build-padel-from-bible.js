const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const BIBLE_EXCEL_PATH = 'C:/Users/59892/Desktop/VTeamfit/REPAIR/Plan de padel ejercicios semana a semana.xlsx';
const MASTER_PATH = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');

// Mapeo exacto para resolver variaciones de nombres del Excel hacia slugs del máster
const EXACT_SLUG_MAP = {
  'defensa lateral': 'defensa-lateral',
  'volea de derecha y de reves': 'volea-de-derecha-y-de-reves',
  'defensa derecha y reves': 'defensa-derecha-y-reves',
  'defensa y ataque, derecha y reves': 'defensa-y-ataque-derecha-y-reves',
  'volea de reves ,bandeja,volea dederecha,bandeja': 'volea-de-reves-bandeja-volea-de-derecha-bandeja',
  'volea de reves, bandeja, volea de derecha, bandeja': 'volea-de-reves-bandeja-volea-de-derecha-bandeja',
  'spreen max. velocidad': 'spreen-max-velocidad',
  'espalda jalon dorsal al pecho': 'jalon-dorsal-pecho',
  'espalda jalon dorsal al  pecho': 'jalon-dorsal-pecho',
  'espalda extension de espalda': 'extension-de-espalda',
  'biceps curl con barra': 'curl-con-barra',
  'biceps curl martillo con mancuernas': 'curl-martillo-con-mancuernas',
  'biceps curl de concentracion': 'curl-concentracion',
  'tren inferior aductores en maquina': 'aductores-en-maquina',
  'tren inferior extension de isquios en maquina': 'extension-de-isquios-maquina',
  'tren inferior hip thrust': 'hip-thrust',
  'saltos laterales a 1 pierna y avanzando': 'saltos-laterales-avanzando',
  'saltos en cajon a 2 pies': 'salto-en-cajon-a-2-pies',
  'explosion en cajon sentandote con 1 pierna': 'explosion-en-cajon-sentandote-con-una-pierna',
  'salto en cajon con 2 pies y caigo con 2': 'salto-en-cajon-con-2-pies-y-caigo-con-2',
  'salto lateral + salto cajon': 'salto-lateral-salto-cajon',
  'spreen con activacion en inicio': 'spreen-con-activacion-en-inicio',
  'pecho press banca con barra': 'press-banca-con-barra',
  'pecho con apertura maquina': 'pecho-con-apertura-maquina',
  'triceps extension con mancuerna': 'extension-con-mancuerna',
  'triceps dips': 'dips',
  'hombros press sentado con mancuernas': 'press-sentado-con-mancuernas',
  'hombros reversa con mancuernas': 'reversa-con-mancuernas',
  'tren inferior extension de cuadriceps en maquina': 'extension-de-cuadriceps-maquiana',
  'tren inferior extension de gemelos en maquina': 'extension-de-gemelo-en-maquina',
  'saltos laterales': 'saltos-laterales',
  'activacion en step a max. velocidad apoyando 2 pies': 'activacion-en-step-a-max-velocidad-apoyando-2-pies',
  'saltos laterales, 2 piernas juntas': 'saltos-laterales-2-piernas-juntas',
  'velocidad max. en step apoyando 1 pie': 'velocidad-max-en-step-apoyando-1-pie',
  'saltos en step abriendo y cerrando piernas': 'saltos-en-step-abriendo-y-cerrando-piernas',
  'desplazamientos laterales y spreen': 'desplazamientos-laterales-y-spreen',
  'cambios de ritmo en cinta': 'cambios-de-ritmo-cinta-corriendo',
  'con pies intercalados,subes 2 y bajas 1': 'escalera-pies-intercalados',
  'saltos con pies juntos, subes 2 bajas 1': 'saltos-con-pies-juntos-subes-2-y-bajas-1',
  'saltos con 2 pies juntos, de 2 2n 2 escalones': 'saltos-con-2-pies-juntos-de-2-en-2-escalones',
  'cintura giros con disco': 'giros-con-disco',
  'tren inferior sentadillas explosivas': 'sentadilla-explosiva',
  'tren inferior gemelos': 'gemelos',
  'espalda lat pulldown maquina': 'lat-pulldown-maquina',
  'espalada remo en polea baja': 'remo-en-polea-baja',
  'biceps curl inversa en polea': 'curl-inversa-en-polea',
  'biceps curl inclinado mancuernas': 'curl-inclinado-mancuernas',
  'biceps curl con cable': 'curl-con-cable',
  'tren inferior peso muerto a 1 pierna': 'peso-muerto-a-una-pierna',
  'tren inferior sentadilla bulgara en banco': 'sentadilla-bulgara',
  'tren inferior sentadillas piernsa juntas': 'sentadillas-piernas-juntas',
  'equilibrio a 1 pierna,golpe de derecha y reves': 'equilibrio-a-1-pierna-golpe-de-derecha-y-reves',
  'esquilibrio a 2 piernas,golpe de derecha y reves': 'equilibrio-a-2-piernas-golpe-de-derecha-y-reves',
  'triceps extension en triceps con polea alta': 'extension-de-triceps-con-polea-alta',
  'triceps extension de triceps con polea alta': 'extension-de-triceps-con-polea-alta',
  'triceps press banca agarre estrecho': 'press-banca-agarre-estrecho',
  'hombros press frontal con barra': 'press-frontal-con-barra',
  'hombros remo al cuello con mancuernas': 'remo-al-cuello-con-mancuernas',
  'hombros remo al cuello con polea baja': 'remo-al-cuello-con-barra',
  'desplazaminetos laterales y spreen': 'desplazamientos-laterales-y-spreen',
  'cardio': 'cinta',
  'sentadillas explosivas': 'sentadilla-explosiva',
  'saltos con pies juntos,subes 2 bajas 1': 'saltos-con-pies-juntos-subes-2-y-bajas-1',
  'espalda en polea alta': 'extension-en-polea-alta-de-pie',
  'volea derecha y reves': 'volea-de-derecha-y-de-reves',
  'tren inferior extension de cuadriceps maquina': 'extension-de-cuadriceps-maquiana',
  'pecho pess inclinado con barra': 'press-inclinado-con-barra',
  'pecho pull over con mancuerna apoyando en banco': 'pull-over-con-mancuerna-apoyado-en-banco',
  'saltos laterales + salto con cajon': 'salto-lateral-salto-cajon',
  'saltos en cajon a 2 pies y caigo con 1': 'salto-cajon-dos-cae-uno'
};

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function slugify(text) {
  let s = normalizeText(text);
  // Eliminar prefijos de grupos musculares
  s = s.replace(/^(espalda|biceps|bíceps|tren inferior|pecho|triceps|tríceps|hombros|antebrazo|cintura)\s+/i, '');
  if (EXACT_SLUG_MAP[s]) return EXACT_SLUG_MAP[s];
  if (EXACT_SLUG_MAP[normalizeText(text)]) return EXACT_SLUG_MAP[normalizeText(text)];
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function main() {
  console.log('📖 Reading Bible Excel: Plan de padel ejercicios semana a semana.xlsx...');
  const wb = xlsx.readFile(BIBLE_EXCEL_PATH);
  const sheetData = xlsx.utils.sheet_to_json(wb.Sheets['Hoja1'], { header: 1 });

  const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const padelPlan = master['plan-padel'];

  if (!padelPlan) {
    throw new Error('plan-padel plan not found in VTEAMFIT_MASTER.json');
  }

  // Mapa de ejercicios existentes
  const masterExercisesMap = new Map();
  (padelPlan.exercises || []).forEach(e => masterExercisesMap.set(e.slug, e));

  // Parsear semanas y días del Excel
  const newSchedule = [];
  let currentWeek = null;
  let globalDayNumber = 1;
  let abdCounter = 0;

  sheetData.forEach((row) => {
    if (!row || row.length === 0) return;
    const firstCell = String(row[0] || '').trim();

    if (/^SEMANA\s+\d+/i.test(firstCell)) {
      const wNum = parseInt(firstCell.match(/\d+/)[0], 10);
      currentWeek = wNum;
    } else if (currentWeek !== null && ['LUNES', 'MARTES', 'MIERCOLES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'SÁBADO', 'DOMINGO'].includes(firstCell.toUpperCase())) {
      const rawDayName = firstCell.toUpperCase();
      const isRest = rawDayName === 'DOMINGO';

      const dayObj = {
        semana: currentWeek,
        dia_nombre: rawDayName === 'MIÉRCOLES' ? 'Miercoles' : (rawDayName === 'SÁBADO' ? 'Sabado' : rawDayName.charAt(0) + rawDayName.slice(1).toLowerCase()),
        dia_numero: globalDayNumber++,
        intensidad: null,
        is_rest: isRest,
        ejercicios: []
      };

      if (!isRest) {
        const rawItems = row.slice(1).filter(c => c !== null && c !== undefined && String(c).trim() !== '');

        // 1. Calentamiento Pre-Partido
        dayObj.ejercicios.push({
          nombre_oficial: 'Calentamiento Pre-Partido',
          slug: 'calentamiento-pre-partido',
          archivo_destino: 'activacion-padel.mp4'
        });

        // 2. Abdominales (si es Martes, Jueves o Sábado)
        const isAbdDay = rawDayName.includes('MARTES') || rawDayName.includes('JUEVES') || rawDayName.includes('SABADO') || rawDayName.includes('SÁBADO');
        if (isAbdDay) {
          const abdNum = (abdCounter % 5) + 1;
          abdCounter++;
          dayObj.ejercicios.push({
            nombre_oficial: `Circuito ${abdNum} Abdominales`,
            slug: `circuito-${abdNum}-abdominales`,
            archivo_destino: `circuito-${abdNum}-abdominales.mp4`
          });
        }

        // 3. Ejercicios principales del Excel
        rawItems.forEach(itemStr => {
          const itemTrimmed = String(itemStr).trim();
          if (itemTrimmed.toUpperCase().startsWith('CALENTAMIENTO')) return;

          const slug = slugify(itemTrimmed);
          const cleanName = itemTrimmed.replace(/^(ESPALDA|BÍCEPS|TREN INFERIOR|PECHO|TRÍCEPS|HOMBROS|ANTEBRAZO|CINTURA)\s+/i, '');

          // Si el ejercicio no existe en masterExercisesMap, lo creamos dinámicamente
          if (!masterExercisesMap.has(slug)) {
            const newExObj = {
              slug: slug,
              nombre_oficial: cleanName,
              name_es: cleanName,
              name_en: cleanName,
              description_es: `Ejercicio para el plan de entrenamiento de pádel.`,
              categoria: 'padel',
              archivo_destino: `${slug}.mp4`,
              video_url: `${slug}.mp4`,
              thumbnail_url: `https://vteamfitjuly2026.b-cdn.net/${slug}.mp4?thumbnail=1`
            };
            masterExercisesMap.set(slug, newExObj);
          }

          const exObj = masterExercisesMap.get(slug);
          dayObj.ejercicios.push({
            nombre_oficial: exObj.nombre_oficial || cleanName,
            slug: slug,
            archivo_destino: exObj.archivo_destino || `${slug}.mp4`
          });
        });

        // 4. Estiramiento al final
        dayObj.ejercicios.push({
          nombre_oficial: 'Estiramiento',
          slug: 'estiramiento',
          archivo_destino: 'estiramiento.mp4'
        });
      }

      newSchedule.push(dayObj);
    }
  });

  padelPlan.schedule = newSchedule;
  padelPlan.exercises = Array.from(masterExercisesMap.values());

  fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));

  console.log(`\n✅ Successfully parsed ${newSchedule.length} days (${currentWeek} weeks) from the Bible Excel.`);
  console.log(`✅ Total unique exercises in plan-padel master: ${padelPlan.exercises.length}`);
  console.log(`✅ Total ABD sessions assigned: ${abdCounter}`);
}

main();
