const fs = require('fs');

const jsonPath = 'C:/Users/59892/Desktop/VTeamfit/REPAIR/exercises_rows (4).json';
const sqlPath = 'C:/Users/59892/Desktop/VTeamfit/REPAIR/update_descriptions.sql';

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Supongo que la tabla se llama 'exercises' o 'ejercicios' (usaré 'exercises' de forma genérica)
let sqlContent = `-- Script para actualizar ÚNICAMENTE las descripciones en español\n`;
sqlContent += `-- Asegurate de que el nombre de la tabla coincida (acá uso "exercises")\n\n`;

data.forEach(item => {
  if (item.id && item.description_es) {
    // Escapar comillas simples duplicándolas (formato estándar de SQL)
    const safeDescription = item.description_es.replace(/'/g, "''");
    sqlContent += `UPDATE exercises SET description_es = '${safeDescription}' WHERE id = '${item.id}';\n`;
  }
});

fs.writeFileSync(sqlPath, sqlContent);
console.log(`Generated ${data.length} SQL UPDATE statements at ${sqlPath}`);
