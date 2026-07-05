const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const SOURCE_DIR = 'D:\\VIDEOS FINALES';
const OUTPUT_DIR = path.join(SOURCE_DIR, 'thumbnails');

// Crear la carpeta de thumbnails si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created output directory: ${OUTPUT_DIR}`);
}

// Leer el directorio de origen
fs.readdir(SOURCE_DIR, (err, files) => {
  if (err) {
    console.error('Error reading source directory:', err);
    process.exit(1);
  }

  // Filtrar solo archivos .mp4 (case insensitive)
  const mp4Files = files.filter(f => f.toLowerCase().endsWith('.mp4'));
  console.log(`Found ${mp4Files.length} MP4 files in ${SOURCE_DIR}`);

  let completed = 0;
  let errors = 0;

  // Procesamiento secuencial para evitar saturar el CPU
  function processFile(index) {
    if (index >= mp4Files.length) {
      console.log(`\n\n🎉 Process finished!`);
      console.log(`- Total processed: ${mp4Files.length}`);
      console.log(`- Success: ${completed}`);
      console.log(`- Errors: ${errors}`);
      return;
    }

    const file = mp4Files[index];
    const sourcePath = path.join(SOURCE_DIR, file);
    const slug = path.basename(file, path.extname(file));
    const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);

    // Comando ffmpeg:
    // -y: Sobreescribir archivo de salida si existe
    // -i: Archivo de entrada
    // -ss: Posicionarse en el segundo 00:00:01
    // -vframes 1: Extraer exactamente 1 frame
    const cmd = `ffmpeg -y -i "${sourcePath}" -ss 00:00:01 -vframes 1 "${outputPath}"`;

    exec(cmd, (execErr) => {
      if (execErr) {
        console.error(`\n❌ Error extracting thumbnail for ${file}:`, execErr.message);
        errors++;
      } else {
        completed++;
      }

      // Loguear progreso en la misma línea
      process.stdout.write(`\rProgress: ${completed + errors}/${mp4Files.length} | Success: ${completed} | Errors: ${errors}`);
      
      // Siguiente archivo
      processFile(index + 1);
    });
  }

  // Iniciar procesamiento
  processFile(0);
});
