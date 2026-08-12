const fs = require('fs');
const path = require('path');

const reportPath = 'C:\\Users\\59892\\.gemini\\antigravity\\brain\\805a4449-d2aa-41b3-b098-e76261180ece\\cotejo_descripciones_padel.md';
const content = fs.readFileSync(reportPath, 'utf8');

// Find the lines with "Match ✅"
const lines = content.split('\n');
const matches = lines.filter(l => l.includes('Match ✅'));

console.log(`Total Matches: ${matches.length}`);
console.log('Matches:');
matches.forEach(m => console.log(m));
