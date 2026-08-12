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

const htmlPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\Hoja1.html';
const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');

function cleanHtmlText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function generateDescription(name, category) {
  const cleanName = name.toLowerCase();
  
  if (cleanName.includes('circuito') && cleanName.includes('abdominales')) {
    return `Circuito completo de ejercicios enfocado en fortalecer el core, mejorar la estabilidad lumbar y definir la zona abdominal de forma progresiva.`;
  }
  if (cleanName.includes('calentamiento pre-partido')) {
    return `Rutina de activación y calentamiento específico antes de entrar a la pista de pádel.`;
  }
  if (cleanName.includes('calentamiento general')) {
    return `Calentamiento cardiovascular y movilidad articular previa al entrenamiento.`;
  }
  if (cleanName.includes('estiramiento')) {
    return `Rutina de estiramientos globales al finalizar la sesión de entrenamiento.`;
  }

  if (cleanName.includes('curl') && cleanName.includes('barra')) {
    return `Ejercicio de fuerza clásico para el desarrollo y fortalecimiento aislado de los bíceps utilizando una barra.`;
  }
  if (cleanName.includes('curl') && (cleanName.includes('mancuerna') || cleanName.includes('martillo'))) {
    return `Ejercicio de flexión de brazos enfocado en trabajar de manera aislada los bíceps y braquiorradiales con mancuernas.`;
  }
  if (cleanName.includes('curl')) {
    return `Ejercicio de aislamiento para el desarrollo de los bíceps mediante flexión controlada del codo.`;
  }
  if (cleanName.includes('press banca')) {
    return `Ejercicio multiarticular clásico para desarrollar la fuerza y masa muscular del pectoral, hombros y tríceps.`;
  }
  if (cleanName.includes('press') && cleanName.includes('mancuerna')) {
    return `Ejercicio de empuje con mancuernas para mejorar la fuerza y simetría muscular del grupo objetivo en un rango de movimiento libre.`;
  }
  if (cleanName.includes('press') && cleanName.includes('inclinado')) {
    return `Ejercicio de empuje inclinado enfocado en el desarrollo de la porción superior del pectoral y los hombros.`;
  }
  if (cleanName.includes('press')) {
    return `Ejercicio de fuerza enfocado en el empuje vertical o de empuje horizontal para desarrollar la fuerza muscular.`;
  }
  if (cleanName.includes('sentadilla') && cleanName.includes('bulgara')) {
    return `Ejercicio unilateral de fuerza excelente para el desarrollo del cuádriceps, glúteos y para mejorar la estabilidad de la cadera.`;
  }
  if (cleanName.includes('sentadilla')) {
    return `Ejercicio fundamental de fuerza para el desarrollo de los cuádriceps, glúteos, isquiotibiales y la estabilidad del tren inferior.`;
  }
  if (cleanName.includes('peso muerto')) {
    return `Ejercicio compuesto para fortalecer la cadena posterior, incluyendo los isquiotibiales, glúteos, erectores espinales y la fuerza de agarre.`;
  }
  if (cleanName.includes('remo')) {
    return `Ejercicio de tracción horizontal para desarrollar la densidad y fuerza de la espalda alta, dorsales y deltoides posterior.`;
  }
  if (cleanName.includes('jalon') || cleanName.includes('pulldown')) {
    return `Ejercicio de tracción vertical excelente para el desarrollo del músculo dorsal ancho y la fuerza general de la espalda.`;
  }
  if (cleanName.includes('extension') && (cleanName.includes('triceps') || cleanName.includes('trieceps'))) {
    return `Ejercicio de aislamiento enfocado en la extensión del codo para el fortalecimiento y definición de los tríceps.`;
  }
  if (cleanName.includes('extension') && cleanName.includes('cuadriceps')) {
    return `Ejercicio de aislamiento en máquina diseñado para fortalecer y definir de forma controlada los cuádriceps.`;
  }
  if (cleanName.includes('extension') && (cleanName.includes('isquios') || cleanName.includes('femoral'))) {
    return `Ejercicio de aislamiento en máquina enfocado en la flexión de rodilla para desarrollar los isquiotibiales.`;
  }
  if (cleanName.includes('extension') && cleanName.includes('gemelo')) {
    return `Ejercicio enfocado en la flexión plantar para fortalecer e hipertrofiar los gemelos.`;
  }
  if (cleanName.includes('extension') && cleanName.includes('espalda')) {
    return `Ejercicio enfocado en la extensión lumbar y dorsal para fortalecer los erectores de la columna y mejorar la postura.`;
  }
  if (cleanName.includes('extension')) {
    return `Ejercicio de aislamiento diseñado para trabajar el grupo muscular objetivo mediante un rango de extensión articular controlado.`;
  }
  if (cleanName.includes('elevacion') && cleanName.includes('lateral')) {
    return `Ejercicio de aislamiento para hombros enfocado en el desarrollo de la cabeza lateral del deltoides para dar amplitud.`;
  }
  if (cleanName.includes('elevacion') && cleanName.includes('frontal')) {
    return `Ejercicio de aislamiento para hombros enfocado en el desarrollo de la porción anterior del deltoides.`;
  }
  if (cleanName.includes('elevacion')) {
    return `Ejercicio enfocado en el desarrollo y fortalecimiento del grupo muscular trabajado a través de un rango de movimiento controlado.`;
  }
  if (cleanName.includes('abductor') || cleanName.includes('adductor')) {
    return `Ejercicio enfocado en fortalecer los músculos abductores de la cadera (glúteo medio y menor) para mejorar la estabilidad.`;
  }
  if (cleanName.includes('aductor') || cleanName.includes('adutor')) {
    return `Ejercicio enfocado en fortalecer los músculos aductores ubicados en la parte interna del muslo.`;
  }
  if (cleanName.includes('hip thrust')) {
    return `El ejercicio de empuje de cadera más efectivo para aislar y desarrollar la fuerza y masa muscular de los glúteos.`;
  }
  if (cleanName.includes('apertura')) {
    return `Ejercicio de aislamiento para pectoral diseñado para estirar e hipertrofiar las fibras del pecho de forma controlada.`;
  }
  if (cleanName.includes('dips') || cleanName.includes('fondos')) {
    return `Ejercicio de empuje corporal muy exigente para desarrollar los tríceps, hombros y el pectoral inferior.`;
  }
  if (cleanName.includes('dominadas')) {
    return `Ejercicio clásico con peso corporal para desarrollar la fuerza relativa de tracción en la espalda y los brazos.`;
  }
  if (cleanName.includes('escalera') || cleanName.includes('step')) {
    return `Ejercicio de coordinación, agilidad y potencia enfocado en mejorar el juego de pies y la velocidad de reacción.`;
  }
  if (cleanName.includes('sprint') || cleanName.includes('spreen')) {
    return `Ejercicio de aceleración máxima diseñado para mejorar la velocidad explosiva y la potencia anaeróbica.`;
  }
  if (cleanName.includes('desplazamiento')) {
    return `Trabajo de agilidad lateral diseñado para mejorar los desplazamientos defensivos y la estabilidad en la pista.`;
  }
  if (cleanName.includes('giro')) {
    return `Ejercicio dinámico enfocado en fortalecer los oblicuos, el abdomen y mejorar la potencia rotacional del core.`;
  }
  if (cleanName.includes('cardio') || cleanName.includes('cinta') || cleanName.includes('eliptica') || cleanName.includes('bicicleta')) {
    return `Ejercicio cardiovascular enfocado en mejorar la resistencia aeróbica, la capacidad respiratoria y la salud del corazón.`;
  }

  if (category === 'abdominales') {
    return `Ejercicio de fortalecimiento de core para mejorar la estabilidad general del cuerpo.`;
  }
  if (category === 'calentamiento') {
    return `Ejercicio preparatorio de movilidad y activación para acondicionar el cuerpo al entrenamiento.`;
  }
  if (category === 'estiramientos') {
    return `Estiramiento estático o de movilidad suave para favorecer la recuperación de los músculos trabajados.`;
  }

  return `Ejercicio de fuerza y acondicionamiento físico diseñado para fortalecer el cuerpo y mejorar el rendimiento.`;
}

async function main() {
  // 1. Read Master file
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const padelExercises = master['plan-padel'].exercises;

  // 2. Read HTML and map descriptions
  const html = fs.readFileSync(htmlPath, 'utf8');
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let match;
  const rows = [];
  while ((match = trRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let tdMatch;
    const cells = [];
    while ((tdMatch = tdRegex.exec(rowHtml)) !== null) {
      cells.push(cleanHtmlText(tdMatch[1]));
    }
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  const htmlMap = new Map();
  rows.forEach((row, idx) => {
    if (idx < 2) return;
    const name = row[3];
    const desc = row[7];
    if (name && name.trim() !== '' && desc && desc.trim() !== '') {
      htmlMap.set(normalize(name), desc);
    }
  });

  console.log('🔄 1. Sincronizando descripciones existentes y generando descripciones faltantes...');

  const dbUpdates = [];
  const logEntries = [];

  padelExercises.forEach(ex => {
    const norm = normalize(ex.name_es);
    let matchedDesc = htmlMap.get(norm);
    let matchType = 'HTML Match ✅';

    if (!matchedDesc) {
      // Fuzzy search fallback
      for (const [key, value] of htmlMap.entries()) {
        if (norm.includes(key) || key.includes(norm)) {
          matchedDesc = value;
          matchType = 'HTML Fuzzy Match 🔍';
          break;
        }
      }
    }

    if (!matchedDesc) {
      matchedDesc = generateDescription(ex.name_es, ex.categoria);
      matchType = 'Generado Programáticamente 🤖';
    }

    // Update in VTEAMFIT_MASTER.json
    ex.description_es = matchedDesc;
    if (!ex.description_en) {
      ex.description_en = 'Exercise for the padel training plan.';
    }

    dbUpdates.push({
      slug: ex.slug,
      description_es: matchedDesc
    });

    logEntries.push({
      name_es: ex.name_es,
      slug: ex.slug,
      description: matchedDesc,
      type: matchType
    });
  });

  // Write updated master file back
  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2), 'utf8');
  console.log('✓ VTEAMFIT_MASTER.json updated and written successfully.');

  // 3. Update Supabase exercises
  console.log('\n🔄 2. Sincronizando todas las descripciones con la base de datos de Supabase...');
  let updatedCount = 0;

  for (const update of dbUpdates) {
    const { error } = await supabase
      .from('exercises')
      .update({ description_es: update.description_es })
      .eq('slug', update.slug);

    if (error) {
      console.error(`❌ Error updating description for slug "${update.slug}":`, error.message);
    } else {
      updatedCount++;
    }
  }

  console.log(`✓ Sincronización de Supabase completada: ${updatedCount} ejercicios actualizados.`);

  // 4. Generate JSON summary/log of updates
  fs.writeFileSync('dry_run_updates.json', JSON.stringify(logEntries, null, 2), 'utf8');
  console.log(`✓ Detalle de actualizaciones guardado en dry_run_updates.json`);
}

main().catch(console.error);
