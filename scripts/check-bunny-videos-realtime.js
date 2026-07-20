const fs = require('fs');
const path = require('path');
const http = require('https');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const CDN_BASE = env.NEXT_PUBLIC_BUNNY_CDN_URL || 'https://vteamfitjuly2026.b-cdn.net';

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = http.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, contentType: res.headers['content-type'], contentLength: res.headers['content-length'] });
    });
    req.on('error', () => {
      resolve({ status: 500, ok: false, contentType: null, contentLength: 0 });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 408, ok: false, contentType: null, contentLength: 0 });
    });
    req.end();
  });
}

async function main() {
  console.log(`🌐 Connecting to Supabase and checking Bunny CDN (${CDN_BASE}) in real time...\n`);

  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('slug, name_es, video_url, thumbnail_url')
    .order('name_es', { ascending: true });

  if (error) {
    console.error('Error fetching exercises:', error);
    return;
  }

  console.log(`📋 Total exercises to verify: ${exercises.length}\n`);

  let validVideos = 0;
  let missingVideos = 0;
  let validThumbnails = 0;
  let missingThumbnails = 0;

  const results = [];

  // Batch process requests concurrently in groups of 15 for high speed
  const BATCH_SIZE = 15;
  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(async (ex) => {
      const videoPath = ex.video_url || `${ex.slug}.mp4`;
      const fullVideoUrl = videoPath.startsWith('http') ? videoPath : `${CDN_BASE}/${videoPath.replace(/^\//, '')}`;
      
      const thumbPath = ex.thumbnail_url || `${ex.slug}.jpg`;
      const fullThumbUrl = thumbPath.startsWith('http') ? thumbPath : `${CDN_BASE}/${thumbPath.replace(/^\//, '')}`;

      const videoRes = await checkUrl(fullVideoUrl);
      const thumbRes = await checkUrl(fullThumbUrl);

      if (videoRes.ok) validVideos++; else missingVideos++;
      if (thumbRes.ok) validThumbnails++; else missingThumbnails++;

      results.push({
        slug: ex.slug,
        name: ex.name_es,
        videoPath,
        fullVideoUrl,
        videoStatus: videoRes.status,
        videoOk: videoRes.ok,
        thumbPath,
        fullThumbUrl,
        thumbStatus: thumbRes.status,
        thumbOk: thumbRes.ok
      });
    }));

    process.stdout.write(` Progress: ${Math.min(i + BATCH_SIZE, exercises.length)} / ${exercises.length} checked...\r`);
  }

  console.log('\n\n📊 Real-Time Verification Results:');
  console.log(`  🎥 Videos: ${validVideos} Online (200 OK) | ${missingVideos} Offline / Error`);
  console.log(`  🖼️ Thumbnails: ${validThumbnails} Online (200 OK) | ${missingThumbnails} Offline / Error\n`);

  // Write markdown report artifact
  let md = `# Reporte de Verificación en Tiempo Real: Bunny CDN\n\n`;
  md += `> **Base CDN:** \`${CDN_BASE}\`\n`;
  md += `> **Fecha y Hora de Auditoría:** ${new Date().toISOString()}\n\n`;
  md += `### Resumen General\n`;
  md += `- **Total de Ejercicios:** ${exercises.length}\n`;
  md += `- **Videos Respondieron HTTP 200 OK:** ${validVideos} (${((validVideos/exercises.length)*100).toFixed(1)}%)\n`;
  md += `- **Videos con Error (404/Fail):** ${missingVideos}\n`;
  md += `- **Thumbnails Respondieron HTTP 200 OK:** ${validThumbnails} (${((validThumbnails/exercises.length)*100).toFixed(1)}%)\n`;
  md += `- **Thumbnails con Error (404/Fail):** ${missingThumbnails}\n\n`;

  md += `| Ejercicio | Estado Video | Estado Thumbnail | Video URL | Thumbnail URL |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  results.sort((a, b) => a.name.localeCompare(b.name));

  results.forEach(r => {
    const vBadge = r.videoOk ? '✅ 200 OK' : `❌ ${r.videoStatus}`;
    const tBadge = r.thumbOk ? '✅ 200 OK' : `❌ ${r.thumbStatus}`;
    md += `| **${r.name}** | ${vBadge} | ${tBadge} | [\`${r.videoPath}\`](${r.fullVideoUrl}) | [\`${r.thumbPath}\`](${r.fullThumbUrl}) |\n`;
  });

  const ARTIFACT_PATH = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/reporte_verificacion_bunny_cdn.md';
  fs.writeFileSync(ARTIFACT_PATH, md);
  console.log(`✅ Detailed report written to ${ARTIFACT_PATH}`);
}

main().catch(console.error);
