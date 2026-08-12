const fs = require('fs');

const master = JSON.parse(fs.readFileSync('VTEAMFIT_MASTER.json', 'utf8'));
const padelExs = master['plan-padel'].exercises;

const uniqueSlugs = new Set();
padelExs.forEach(ex => uniqueSlugs.add(ex.slug));

console.log('Total exercises in plan-padel.exercises array:', padelExs.length);
console.log('Unique slugs in plan-padel.exercises:', uniqueSlugs.size);
