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

  console.log(`Total rows: ${rows.length}`);
  console.log('Dumping first 40 rows:');
  for (let i = 0; i < 40; i++) {
    if (rows[i]) {
      console.log(`Row ${i + 1}:`, rows[i].slice(0, 10));
    }
  }
}

main().catch(console.error);
