import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually
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

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const MASTER_PATH = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
const BUNNY_CDN_BASE = env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://vteamfit2026.b-cdn.net';

async function main() {
  console.log('🚀 Starting ingestion process with UUID mapping...');

  if (!fs.existsSync(MASTER_PATH)) {
    console.error('VTEAMFIT_MASTER.json not found');
    process.exit(1);
  }

  const masterData = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const planSlugs = Object.keys(masterData);

  // 1. GLOBAL CLEAN-UP
  console.log('🧹 Clearing existing hierarchy data (Global Clean-up)...');
  const { error: delRelErr } = await supabase.from('day_exercises').delete().neq('day_id', '00000000-0000-0000-0000-000000000000'); // Delete all
  const { error: delDayErr } = await supabase.from('days').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: delWeekErr } = await supabase.from('weeks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delRelErr || delDayErr || delWeekErr) {
     console.warn('Note: Clean-up had some issues (might be empty tables), proceeding...');
  }

  // 2. Ingest Exercises and build map
  console.log('📦 Ingesting exercises and building UUID map...');
  const allExercises = new Map();
  for (const slug of planSlugs) {
    const plan = masterData[slug];
    const combinedSource = [...(plan.exercises || [])];
    (plan.schedule || []).forEach((day: any) => {
      if (day.ejercicios) combinedSource.push(...day.ejercicios);
    });

    combinedSource.forEach((ex: any) => {
      if (!ex.slug) return;
      if (!allExercises.has(ex.slug)) {
        const videoFilename = ex.archivo_destino || ex.slug + '.mp4';
        allExercises.set(ex.slug, {
          slug: ex.slug,
          name_es: ex.nombre_oficial || ex.slug,
          name_en: ex.nombre_oficial || ex.slug,
          description_es: '', 
          video_url: videoFilename,
          thumbnail_url: `${BUNNY_CDN_BASE}/${videoFilename}?thumbnail=1`
        });
      }
    });
  }

  const exerciseList = Array.from(allExercises.values());
  const { error: exError } = await supabase.from('exercises').upsert(exerciseList, { onConflict: 'slug' });
  if (exError) throw exError;

  const { data: exRows, error: exFetchErr } = await supabase.from('exercises').select('id, slug');
  if (exFetchErr) throw exFetchErr;
  const exerciseMap = new Map(exRows.map(r => [r.slug, r.id]));
  console.log(`✅ Exercises ready. Mapping established for ${exerciseMap.size} slugs.`);

  // 3. Ingest Plans and build map
  console.log('📋 Ingesting plans...');
  const plansToInsert = planSlugs.map(slug => {
    const p = masterData[slug];
    const name = slug.replace(/-/g, ' ').toUpperCase();
    return {
      slug: slug,
      name_es: name,
      name_en: name,
      description_es: '',
      description_en: '',
      price: slug === 'fisico-en-pista-padel' ? 249 : 49.9,
      plan_type: p.plan === 'fisico-en-pista-padel' ? 'modules_exercises' : 'weeks_days',
      duration_days: p.stats?.dias_totales || p.stats?.ejercicios_totales || 0,
      cover_image: `/images/fotos/${slug}.jpg`
    };
  });
  
  const { data: insertedPlans, error: planError } = await supabase.from('plans').upsert(plansToInsert, { onConflict: 'slug' }).select();
  if (planError) throw planError;
  const planMap = new Map(insertedPlans.map(r => [r.slug, r.id]));

  // 4. Hierarchy Ingestion
  const allDayExercises: any[] = [];

  for (const planRow of insertedPlans!) {
    console.log(`🏗️  Processing hierarchy for: ${planRow.slug}`);
    const source = masterData[planRow.slug];
    
    if (planRow.plan_type === 'weeks_days') {
      const schedule = source.schedule || [];
      const weeksData = new Map<number, any[]>();
      schedule.forEach((dayData: any) => {
        let weekNum = dayData.semana || Math.ceil(dayData.dia_numero / 7);
        if (!weeksData.has(weekNum)) weeksData.set(weekNum, []);
        weeksData.get(weekNum)!.push(dayData);
      });

      for (const [weekNum, days] of weeksData.entries()) {
        const { data: weekRow, error: wErr } = await supabase.from('weeks').insert({
          plan_id: planRow.id,
          week_number: weekNum
        }).select().single();
        if (wErr) throw wErr;

        for (const d of days) {
          const { data: dayRow, error: dErr } = await supabase.from('days').insert({
            week_id: weekRow.id,
            day_number: d.dia_numero,
            is_rest_day: d.is_rest || false,
            title: d.dia_nombre || `Día ${d.dia_numero}`,
            intensity: d.intensidad
          }).select().single();
          if (dErr) throw dErr;

          if (d.ejercicios && d.ejercicios.length > 0) {
            d.ejercicios.forEach((ex: any, idx: number) => {
              const exUuid = exerciseMap.get(ex.slug);
              if (exUuid) {
                allDayExercises.push({ 
                  day_id: dayRow.id, 
                  exercise_id: exUuid,
                  position: idx 
                });
              } else {
                console.warn(`⚠️  Exercise slug not found in map: ${ex.slug}`);
              }
            });
          }
        }
      }
    } else {
      // Físico en Pista
      const modules = source.schedule || [];
      const weekGroups = [
        { week: 1, mods: modules.filter((m: any) => m.dia_numero >= 1 && m.dia_numero <= 5), restCount: 2 },
        { week: 2, mods: modules.filter((m: any) => m.dia_numero >= 6 && m.dia_numero <= 10), restCount: 2 },
        { week: 3, mods: modules.filter((m: any) => m.dia_numero >= 11 && m.dia_numero <= 15), restCount: 2 },
        { week: 4, mods: modules.filter((m: any) => m.dia_numero >= 16 && m.dia_numero <= 19), restCount: 3 }
      ];

      let globalDayCounter = 1;
      for (const group of weekGroups) {
        const { data: weekRow, error: wErr } = await supabase.from('weeks').insert({
          plan_id: planRow.id,
          week_number: group.week
        }).select().single();
        if (wErr) throw wErr;

        for (const m of group.mods) {
          const { data: dayRow, error: dErr } = await supabase.from('days').insert({
            week_id: weekRow.id,
            day_number: globalDayCounter++,
            is_rest_day: false,
            title: m.titulo || `Módulo ${m.dia_numero}`,
            recommended: m.recomendados,
            intensity: m.intensidad || 'MEDIO'
          }).select().single();
          if (dErr) throw dErr;

          if (m.ejercicios && m.ejercicios.length > 0) {
            m.ejercicios.forEach((ex: any, idx: number) => {
              const exUuid = exerciseMap.get(ex.slug);
              if (exUuid) {
                allDayExercises.push({ 
                  day_id: dayRow.id, 
                  exercise_id: exUuid,
                  position: idx 
                });
              }
            });
          }
        }
        for (let i = 0; i < group.restCount; i++) {
          await supabase.from('days').insert({
            week_id: weekRow.id,
            day_number: globalDayCounter++,
            is_rest_day: true,
            title: 'Descanso',
            intensity: null
          });
        }
      }
    }
    console.log(`✅ Plan ${planRow.slug} structure created. Linkings pending batch...`);
  }

  // 5. Batch Insert Day Exercises
  console.log(`🔗 Linking ${allDayExercises.length} exercise relations...`);
  // Split into chunks to avoid potential request size limits
  const chunkSize = 500;
  for (let i = 0; i < allDayExercises.length; i += chunkSize) {
    const chunk = allDayExercises.slice(i, i + chunkSize);
    const { error: relErr } = await supabase.from('day_exercises').insert(chunk);
    if (relErr) throw relErr;
  }

  console.log('\n📊 FINAL COUNTS:');
  const tables = ['plans', 'exercises', 'weeks', 'days', 'day_exercises'];
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table.padEnd(15)}: ${count} rows`);
  }

  console.log('\n✨ Ingestion completed successfully!');
}

main().catch(err => {
  console.error('❌ Error during ingestion:', err);
  process.exit(1);
});
