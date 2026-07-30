const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('https');
const { spawn } = require('child_process');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const CDN_BASE = env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://vteamfitjuly2026.b-cdn.net';
const BASE_URL = 'http://localhost:3000';

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300 });
    });
    req.on('error', () => resolve({ status: 500, ok: false }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 408, ok: false }); });
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting Next.js background server on port 3000...');
  const nextProcess = spawn('npx', ['next', 'start', '-p', '3000'], {
    cwd: process.cwd(),
    shell: true,
    env: { ...process.env, PORT: '3000' }
  });

  await new Promise(r => setTimeout(r, 4000));

  console.log('🔍 Querying Supabase for "Transforma Tu Cuerpo" (transforma-tu-cuerpo)...');
  const { data: plan } = await supabase.from('plans').select('id, name_es, slug').eq('slug', 'transforma-tu-cuerpo').single();
  const { data: weeks } = await supabase.from('weeks').select('id, week_number').eq('plan_id', plan.id).order('week_number', { ascending: true });

  console.log(`📋 Found ${weeks.length} weeks in Transforma Tu Cuerpo. Fetching days and exercises...`);

  const exerciseMap = new Map();
  const dayRoutes = [];

  for (const week of weeks) {
    const { data: days } = await supabase.from('days').select('id, day_number, is_rest_day').eq('week_id', week.id).order('day_number', { ascending: true });
    for (const day of days) {
      if (!day.is_rest_day) {
        const { data: rels } = await supabase.from('day_exercises').select('position, exercise:exercises(id, slug, name_es, video_url, thumbnail_url)').eq('day_id', day.id).order('position', { ascending: true });
        rels.forEach(r => {
          if (r.exercise && !exerciseMap.has(r.exercise.id)) {
            exerciseMap.set(r.exercise.id, r.exercise);
          }
        });
        dayRoutes.push({
          week: week.week_number,
          day: day.day_number,
          exercises: rels.map(r => r.exercise)
        });
      }
    }
  }

  const uniqueExercises = Array.from(exerciseMap.values());
  console.log(`📊 Unique exercises in Transforma Tu Cuerpo: ${uniqueExercises.length}`);

  console.log('🌐 1. Testing Bunny CDN Real-Time Availability for Transforma Tu Cuerpo...');
  let video200Count = 0;
  let video404Count = 0;
  let thumb200Count = 0;
  let thumb404Count = 0;

  const cdnResults = [];

  const BATCH_SIZE = 15;
  for (let i = 0; i < uniqueExercises.length; i += BATCH_SIZE) {
    const batch = uniqueExercises.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (ex) => {
      const vPath = ex.video_url || `${ex.slug}.mp4`;
      const fullVUrl = vPath.startsWith('http') ? vPath : `${CDN_BASE}/${vPath.replace(/^\//, '')}`;

      const tPath = ex.thumbnail_url || `${ex.slug}.jpg`;
      const fullTUrl = tPath.startsWith('http') ? tPath : `${CDN_BASE}/${tPath.replace(/^\//, '')}`;

      const vRes = await checkUrl(fullVUrl);
      const tRes = await checkUrl(fullTUrl);

      if (vRes.ok) video200Count++; else video404Count++;
      if (tRes.ok) thumb200Count++; else thumb404Count++;

      cdnResults.push({
        slug: ex.slug,
        name: ex.name_es,
        vPath,
        fullVUrl,
        vOk: vRes.ok,
        vStatus: vRes.status,
        tPath,
        fullTUrl,
        tOk: tRes.ok,
        tStatus: tRes.status
      });
    }));
  }

  console.log('\n🤖 2. Launching Puppeteer Browser Instance for E2E App Crawl...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const dayAuditResults = [];
  let totalDaysChecked = 0;

  for (const route of dayRoutes) {
    const url = `${BASE_URL}/dashboard/semana/${route.week}/dia/${route.day}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await new Promise(r => setTimeout(r, 400));

      const mediaStatus = await page.evaluate(() => {
        const mediaElems = Array.from(document.querySelectorAll('video, img'));
        return mediaElems.map(el => {
          if (el.tagName.toLowerCase() === 'video') {
            return { type: 'video', src: el.src, error: !!el.error };
          }
          return { type: 'img', src: el.src, complete: el.complete, naturalWidth: el.naturalWidth };
        });
      });

      let dayOk = true;
      mediaStatus.forEach(m => {
        if (m.type === 'video' && m.error) dayOk = false;
        if (m.type === 'img' && (!m.complete || m.naturalWidth === 0)) dayOk = false;
      });

      dayAuditResults.push({
        week: route.week,
        day: route.day,
        url,
        exerciseCount: route.exercises.length,
        status: dayOk ? 'OK' : 'FAIL'
      });

      totalDaysChecked++;
      process.stdout.write(` Checked Week ${route.week} Day ${route.day} (${totalDaysChecked}/${dayRoutes.length})...\r`);
    } catch (err) {
      dayAuditResults.push({
        week: route.week,
        day: route.day,
        url,
        exerciseCount: route.exercises.length,
        status: 'ERROR'
      });
    }
  }

  console.log('\n\n✨ Closing Puppeteer Browser & Stopping background server...');
  await browser.close();
  nextProcess.kill();

  console.log('\n📊 Transforma Tu Cuerpo Audit Summary:');
  console.log(`  🎥 Bunny CDN Videos 200 OK: ${video200Count} / ${uniqueExercises.length} (${((video200Count/uniqueExercises.length)*100).toFixed(1)}%)`);
  console.log(`  🎥 Bunny CDN Videos 404: ${video404Count}`);
  console.log(`  🖼️ Bunny CDN Thumbnails 200 OK: ${thumb200Count} / ${uniqueExercises.length}`);
  console.log(`  🤖 Puppeteer E2E Days Passed: ${dayAuditResults.filter(d => d.status === 'OK').length} / ${dayAuditResults.length}`);

  let md = `# Informe de Auditoría E2E: Transforma Tu Cuerpo\n\n`;
  md += `> **Plan:** \`transforma-tu-cuerpo\` (${weeks.length} semanas / ${dayRoutes.length} días activos de entrenamiento)\n`;
  md += `> **Servidor Bunny CDN:** \`${CDN_BASE}\`\n`;
  md += `> **Fecha Auditoría en Vivo:** ${new Date().toISOString()}\n\n`;

  md += `### Resumen de la Auditoría\n`;
  md += `- **Total de Ejercicios Únicos del Plan:** ${uniqueExercises.length}\n`;
  md += `- **Videos en Bunny CDN (200 OK):** **${video200Count} de ${uniqueExercises.length} (${((video200Count/uniqueExercises.length)*100).toFixed(1)}% ONLINE)**\n`;
  md += `- **Videos Faltantes en Bunny (404):** **${video404Count}**\n`;
  md += `- **Thumbnails en Bunny CDN (200 OK):** **${thumb200Count} de ${uniqueExercises.length}**\n`;
  md += `- **Días Auditados con Puppeteer en la App:** ${dayAuditResults.filter(d => d.status === 'OK').length} de ${dayAuditResults.length} Días OK ✅\n\n`;

  md += `### Detalle Ejercicio por Ejercicio (Supabase vs Bunny CDN)\n\n`;
  md += `| Ejercicio (Supabase \`name_es\`) | Slug (\`slug\`) | Estado Video Bunny | Estado Thumbnail Bunny | Archivo Video (\`video_url\`) |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  cdnResults.sort((a, b) => a.name.localeCompare(b.name));

  cdnResults.forEach(r => {
    const vBadge = r.vOk ? '✅ 200 OK' : `❌ ${r.vStatus}`;
    const tBadge = r.tOk ? '✅ 200 OK' : `❌ ${r.tStatus}`;
    md += `| **${r.name}** | \`${r.slug}\` | ${vBadge} | ${tBadge} | [\`${r.vPath}\`](${r.fullVUrl}) |\n`;
  });

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/informe_auditoria_puppeteer_e2e_transforma_tu_cuerpo.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ Artifact written to ${ARTIFACT_PATH}`);
}

main().catch(console.error);
