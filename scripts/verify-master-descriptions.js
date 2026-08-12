const fs = require('fs');
const path = require('path');

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

async function main() {
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const padelExercises = master['plan-padel'].exercises;

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

  let htmlMatchCount = 0;
  let generatedCount = 0;
  let missingCount = 0;
  const list = [];

  padelExercises.forEach(ex => {
    const norm = normalize(ex.name_es);
    let matchedDesc = htmlMap.get(norm);
    let source = 'Excel/HTML 📄';

    if (!matchedDesc) {
      for (const [key, value] of htmlMap.entries()) {
        if (norm.includes(key) || key.includes(norm)) {
          matchedDesc = value;
          source = 'Excel/HTML (Fuzzy) 🔍';
          break;
        }
      }
    }

    if (matchedDesc) {
      htmlMatchCount++;
    } else {
      if (ex.description_es && ex.description_es.trim() !== '') {
        generatedCount++;
        source = 'Generado Programáticamente 🤖';
      } else {
        missingCount++;
        source = 'FALTANTE ❌';
      }
    }

    list.push({
      name: ex.name_es,
      slug: ex.slug,
      description: ex.description_es || 'SIN DESCRIPCIÓN',
      source: source
    });
  });

  let report = `# Reporte Actualizado de Descripciones del Plan Pádel\n\n`;
  report += `> **Total de Ejercicios del Plan Pádel (DB):** ${padelExercises.length}\n`;
  report += `> **Con Descripción de Excel/HTML:** ${htmlMatchCount} ✅\n`;
  report += `> **Con Descripción Generada Autotemplada:** ${generatedCount} 🤖\n`;
  report += `> **Sin Descripción (Vacíos):** **${missingCount}** ${missingCount === 0 ? '🎉 (¡Ninguno!)' : '❌'}\n\n`;

  report += `### Listado Completo Correlativo con Origen de Datos\n\n`;
  report += `| Ejercicio en DB | Descripción Actualizada | Origen de Descripción |\n`;
  report += `| :--- | :--- | :--- |\n`;

  list.sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
    report += `| **${item.name}** (\`${item.slug}\`) | ${item.description} | ${item.source} |\n`;
  });

  const reportPath = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/cotejo_descripciones_padel.md';
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`Report updated successfully at: ${reportPath}`);
  console.log(`Total: ${padelExercises.length}, HTML Matches: ${htmlMatchCount}, Generated: ${generatedCount}, Empty: ${missingCount}`);
}

main().catch(console.error);
