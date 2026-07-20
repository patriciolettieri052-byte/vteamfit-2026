const fs = require('fs');
const path = require('path');

const SOURCE_VIDEOS_DIR = 'C:/Users/59892/Desktop/VTeamfit/videos calentamiento';
const TARGET_VIDEOS_DIR = 'D:/VIDEOS FINALES';
const MASTER_PATH = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');

// Mapeo de copias de archivos con slugs limpios
const VIDEO_COPIES = [
  { src: 'activacion padel.mp4', dest: 'activacion-padel.mp4' },
  { src: 'calentamiento general_vteamfit-1.mp4', dest: 'calentamiento-general.mp4' },
  { src: 'circuito 1 abdominales.mp4', dest: 'circuito-1-abdominales.mp4' },
  { src: 'circuito 2 abdominales.mp4', dest: 'circuito-2-abdominales.mp4' },
  { src: 'circuito 3 abdominales.mp4', dest: 'circuito-3-abdominales.mp4' },
  { src: 'circuito 4 abdominales-1.mp4', dest: 'circuito-4-abdominales.mp4' },
  { src: 'circuito 5 abdominales.mp4', dest: 'circuito-5-abdominales.mp4' },
  { src: 'estiramiento_vteamfit.mp4', dest: 'estiramiento.mp4' },
];

const NEW_EXERCISES = [
  {
    slug: 'calentamiento-pre-partido',
    nombre_oficial: 'Calentamiento Pre-Partido',
    name_es: 'Calentamiento Pre-Partido',
    name_en: 'Pre-Match Warm-up',
    description_es: 'Rutina de activación y calentamiento específico antes de entrar a la pista de pádel.',
    description_en: 'Activation and warm-up routine before entering the padel court.',
    categoria: 'calentamiento',
    archivo_destino: 'activacion-padel.mp4',
    video_url: 'activacion-padel.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/activacion-padel.mp4?thumbnail=1'
  },
  {
    slug: 'calentamiento-general',
    nombre_oficial: 'Calentamiento General',
    name_es: 'Calentamiento General',
    name_en: 'General Warm-up',
    description_es: 'Calentamiento cardiovascular y movilidad articular previa al entrenamiento.',
    description_en: 'Cardiovascular warm-up and joint mobility prior to workout.',
    categoria: 'calentamiento',
    archivo_destino: 'calentamiento-general.mp4',
    video_url: 'calentamiento-general.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/calentamiento-general.mp4?thumbnail=1'
  },
  {
    slug: 'circuito-1-abdominales',
    nombre_oficial: 'Circuito 1 Abdominales',
    name_es: 'Circuito 1 Abdominales',
    name_en: 'Abdominal Circuit 1',
    description_es: 'Circuito completo de fortalecimiento de core y zona abdominal N° 1.',
    description_en: 'Complete core and abdominal strengthening circuit No. 1.',
    categoria: 'abdominales',
    archivo_destino: 'circuito-1-abdominales.mp4',
    video_url: 'circuito-1-abdominales.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/circuito-1-abdominales.mp4?thumbnail=1'
  },
  {
    slug: 'circuito-2-abdominales',
    nombre_oficial: 'Circuito 2 Abdominales',
    name_es: 'Circuito 2 Abdominales',
    name_en: 'Abdominal Circuit 2',
    description_es: 'Circuito completo de fortalecimiento de core y zona abdominal N° 2.',
    description_en: 'Complete core and abdominal strengthening circuit No. 2.',
    categoria: 'abdominales',
    archivo_destino: 'circuito-2-abdominales.mp4',
    video_url: 'circuito-2-abdominales.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/circuito-2-abdominales.mp4?thumbnail=1'
  },
  {
    slug: 'circuito-3-abdominales',
    nombre_oficial: 'Circuito 3 Abdominales',
    name_es: 'Circuito 3 Abdominales',
    name_en: 'Abdominal Circuit 3',
    description_es: 'Circuito completo de fortalecimiento de core y zona abdominal N° 3.',
    description_en: 'Complete core and abdominal strengthening circuit No. 3.',
    categoria: 'abdominales',
    archivo_destino: 'circuito-3-abdominales.mp4',
    video_url: 'circuito-3-abdominales.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/circuito-3-abdominales.mp4?thumbnail=1'
  },
  {
    slug: 'circuito-4-abdominales',
    nombre_oficial: 'Circuito 4 Abdominales',
    name_es: 'Circuito 4 Abdominales',
    name_en: 'Abdominal Circuit 4',
    description_es: 'Circuito completo de fortalecimiento de core y zona abdominal N° 4.',
    description_en: 'Complete core and abdominal strengthening circuit No. 4.',
    categoria: 'abdominales',
    archivo_destino: 'circuito-4-abdominales.mp4',
    video_url: 'circuito-4-abdominales.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/circuito-4-abdominales.mp4?thumbnail=1'
  },
  {
    slug: 'circuito-5-abdominales',
    nombre_oficial: 'Circuito 5 Abdominales',
    name_es: 'Circuito 5 Abdominales',
    name_en: 'Abdominal Circuit 5',
    description_es: 'Circuito completo de fortalecimiento de core y zona abdominal N° 5.',
    description_en: 'Complete core and abdominal strengthening circuit No. 5.',
    categoria: 'abdominales',
    archivo_destino: 'circuito-5-abdominales.mp4',
    video_url: 'circuito-5-abdominales.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/circuito-5-abdominales.mp4?thumbnail=1'
  },
  {
    slug: 'estiramiento',
    nombre_oficial: 'Estiramiento',
    name_es: 'Estiramiento',
    name_en: 'Stretching',
    description_es: 'Rutina de estiramientos globales al finalizar la sesión de entrenamiento.',
    description_en: 'Global stretching routine after finishing the training session.',
    categoria: 'estiramientos',
    archivo_destino: 'estiramiento.mp4',
    video_url: 'estiramiento.mp4',
    thumbnail_url: 'https://vteamfitjuly2026.b-cdn.net/estiramiento.mp4?thumbnail=1'
  }
];

const NEW_SLUGS = new Set(NEW_EXERCISES.map(e => e.slug));

function main() {
  console.log('1. Copying and renaming video files...');
  if (fs.existsSync(TARGET_VIDEOS_DIR)) {
    VIDEO_COPIES.forEach(({ src, dest }) => {
      const srcPath = path.join(SOURCE_VIDEOS_DIR, src);
      const destPath = path.join(TARGET_VIDEOS_DIR, dest);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Copied: ${src} -> ${dest}`);
      } else {
        console.warn(`  ⚠️ Source video not found: ${srcPath}`);
      }
    });
  } else {
    console.warn(`Target videos directory ${TARGET_VIDEOS_DIR} not found, skipping local copy.`);
  }

  console.log('\n2. Updating VTEAMFIT_MASTER.json...');
  const master = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const padelPlan = master['plan-padel'];

  if (!padelPlan) {
    throw new Error('plan-padel not found in VTEAMFIT_MASTER.json');
  }

  // Ensure exercises list has the 8 new exercises
  if (!padelPlan.exercises) padelPlan.exercises = [];
  NEW_EXERCISES.forEach(newEx => {
    const idx = padelPlan.exercises.findIndex(e => e.slug === newEx.slug);
    if (idx >= 0) {
      padelPlan.exercises[idx] = { ...padelPlan.exercises[idx], ...newEx };
    } else {
      padelPlan.exercises.push(newEx);
    }
  });

  // Process schedule
  const schedule = padelPlan.schedule || [];
  let abdCounter = 0;
  let updatedDaysCount = 0;

  schedule.forEach(day => {
    if (day.is_rest) return;

    let exercises = day.ejercicios || [];
    // Remove any previous instances of these new slugs to avoid duplication on re-run
    exercises = exercises.filter(e => !NEW_SLUGS.has(e.slug));

    const calentamientoEx = {
      nombre_oficial: 'Calentamiento Pre-Partido',
      slug: 'calentamiento-pre-partido',
      archivo_destino: 'activacion-padel.mp4'
    };

    const estiramientoEx = {
      nombre_oficial: 'Estiramiento',
      slug: 'estiramiento',
      archivo_destino: 'estiramiento.mp4'
    };

    const dayName = (day.dia_nombre || '').toLowerCase();
    const isAbdDay = dayName.includes('martes') || dayName.includes('jueves') || dayName.includes('sabado') || dayName.includes('sábado');

    if (isAbdDay) {
      const abdNum = (abdCounter % 5) + 1;
      abdCounter++;
      const abdEx = {
        nombre_oficial: `Circuito ${abdNum} Abdominales`,
        slug: `circuito-${abdNum}-abdominales`,
        archivo_destino: `circuito-${abdNum}-abdominales.mp4`
      };
      day.ejercicios = [calentamientoEx, abdEx, ...exercises, estiramientoEx];
    } else {
      day.ejercicios = [calentamientoEx, ...exercises, estiramientoEx];
    }

    updatedDaysCount++;
  });

  fs.writeFileSync(MASTER_PATH, JSON.stringify(master, null, 2));
  console.log(`  ✓ Updated ${updatedDaysCount} active days in plan-padel.`);
  console.log(`  ✓ Total ABD sessions mapped: ${abdCounter}`);
  console.log('\n✨ Update completed successfully!');
}

main();
