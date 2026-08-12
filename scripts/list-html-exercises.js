const fs = require('fs');
const htmlPath = 'C:\\Users\\59892\\Desktop\\VTeamfit\\Hoja1.html';

function cleanHtmlText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
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

  const htmlExercises = new Map();
  rows.forEach((row, idx) => {
    if (idx < 2) return;
    const name = row[3];
    const desc = row[7];
    if (name && name.trim() !== '') {
      if (!htmlExercises.has(name)) {
        htmlExercises.set(name, { desc: desc || '', count: 1 });
      } else {
        htmlExercises.get(name).count++;
        if (desc && desc.trim() !== '') {
          htmlExercises.get(name).desc = desc;
        }
      }
    }
  });

  console.log(`Found ${htmlExercises.size} unique exercise names in HTML:`);
  Array.from(htmlExercises.entries()).forEach(([name, data]) => {
    console.log(`- "${name}" (Count: ${data.count}, HasDesc: ${!!data.desc}): "${data.desc}"`);
  });
}

main().catch(console.error);
