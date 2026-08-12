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

  const missing = [];
  padelExercises.forEach(ex => {
    const norm = normalize(ex.name_es);
    let matchedDesc = htmlMap.get(norm);
    if (!matchedDesc) {
      for (const [key, value] of htmlMap.entries()) {
        if (norm.includes(key) || key.includes(norm)) {
          matchedDesc = value;
          break;
        }
      }
    }

    if (!matchedDesc) {
      missing.push({
        slug: ex.slug,
        name_es: ex.name_es,
        categoria: ex.categoria
      });
    }
  });

  fs.writeFileSync('missing_exercises.json', JSON.stringify(missing, null, 2));
  console.log(`Saved ${missing.length} missing exercises to missing_exercises.json`);
}

main().catch(console.error);
