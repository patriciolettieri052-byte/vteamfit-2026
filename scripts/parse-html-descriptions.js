const fs = require('fs');
const path = require('path');

const htmlPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\Hoja1.html';
const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');

function cleanHtmlText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // remove non-alphanumeric
}

async function main() {
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ HTML file not found: ${htmlPath}`);
    return;
  }

  // 1. Read master exercises for plan-padel
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const padelExercises = master['plan-padel'].exercises;
  console.log(`📋 Loaded ${padelExercises.length} exercises from plan-padel in master file.\n`);

  // 2. Parse HTML rows
  const html = fs.readFileSync(htmlPath, 'utf8');
  
  // Find all <tr> tags
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let match;
  const rows = [];

  while ((match = trRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    // Find all <td> tags in this row
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

  console.log(`📊 Parsed ${rows.length} rows from HTML file.`);

  // 3. Map HTML exercises and descriptions
  const htmlMap = new Map(); // normalizedName -> description
  
  rows.forEach((row, rowIndex) => {
    if (rowIndex < 2) return; // Skip headers
    const name = row[3]; // Col D (index 3)
    const desc = row[7]; // Col H (index 7)

    if (name && name.trim() !== '') {
      const normName = normalize(name);
      if (desc && desc.trim() !== '') {
        if (!htmlMap.has(normName)) {
          htmlMap.set(normName, { originalName: name, description: desc, row: rowIndex + 1 });
        }
      }
    }
  });

  console.log(`🔍 Found ${htmlMap.size} unique exercises with descriptions in the HTML file.\n`);

  // 4. Compare Master Plan Padel exercises with HTML descriptions
  const comparison = [];
  let missingCount = 0;

  padelExercises.forEach(ex => {
    const normName = normalize(ex.name_es);
    let htmlMatch = htmlMap.get(normName);
    
    // Fuzzy matching fallback
    if (!htmlMatch) {
      for (const [key, value] of htmlMap.entries()) {
        if (normName.includes(key) || key.includes(normName)) {
          htmlMatch = value;
          break;
        }
      }
    }

    if (htmlMatch) {
      comparison.push({
        slug: ex.slug,
        name_db: ex.name_es,
        name_html: htmlMatch.originalName,
        desc_html: htmlMatch.description,
        status: 'Match ✅'
      });
    } else {
      missingCount++;
      comparison.push({
        slug: ex.slug,
        name_db: ex.name_es,
        name_html: 'N/A',
        desc_html: 'N/A',
        status: 'FALTA ❌'
      });
    }
  });

  // Sort comparison: missing first, then matched
  comparison.sort((a, b) => {
    if (a.status.includes('FALTA') && !b.status.includes('FALTA')) return -1;
    if (!a.status.includes('FALTA') && b.status.includes('FALTA')) return 1;
    return a.name_db.localeCompare(b.name_db);
  });

  // 5. Generate Markdown Report
  let report = `# Reporte de Cotejo de Descripciones: Plan Pádel vs Hoja1.html\n\n`;
  report += `> **Total de Ejercicios del Plan Pádel (DB):** ${padelExercises.length}\n`;
  report += `> **Ejercicios con Descripción en el HTML:** ${padelExercises.length - missingCount}\n`;
  report += `> **Ejercicios sin Descripción:** **${missingCount}** ❌\n\n`;

  report += `### Ejercicios Sin Descripción en el HTML\n`;
  const missingList = comparison.filter(c => c.status.includes('FALTA'));
  if (missingList.length === 0) {
    report += `🎉 ¡Perfecto! Todos los ejercicios del Plan Pádel tienen su descripción en el HTML.\n\n`;
  } else {
    report += `A continuación se listan los ejercicios que no se encontraron en el archivo Excel/HTML:\n\n`;
    report += `| Ejercicio (DB) | Slug | Estado |\n`;
    report += `| :--- | :--- | :--- |\n`;
    missingList.forEach(m => {
      report += `| **${m.name_db}** | \`${m.slug}\` | ❌ Faltante |\n`;
    });
    report += `\n`;
  }

  report += `### Listado Completo Correlativo (DB vs HTML)\n\n`;
  report += `| Ejercicio en DB (name_es) | Ejercicio en HTML | Descripción en HTML | Estado |\n`;
  report += `| :--- | :--- | :--- | :--- |\n`;
  
  comparison.forEach(c => {
    report += `| **${c.name_db}** | ${c.name_html} | ${c.desc_html} | ${c.status} |\n`;
  });

  const reportPath = 'C:/Users/59892/.gemini/antigravity/brain/805a4449-d2aa-41b3-b098-e76261180ece/cotejo_descripciones_padel.md';
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n🎉 Report generated successfully at: ${reportPath}`);
}

main().catch(console.error);
