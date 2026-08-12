const fs = require('fs');

const master = JSON.parse(fs.readFileSync('VTEAMFIT_MASTER.json', 'utf8'));
const padelExs = master['plan-padel'].exercises;

const uniqueCategories = new Set();
padelExs.forEach(ex => uniqueCategories.add(ex.categoria));

console.log('Categories in plan-padel exercises:', Array.from(uniqueCategories));
console.log('Total exercises:', padelExs.length);

const categoriesCount = {};
padelExs.forEach(ex => {
  categoriesCount[ex.categoria] = (categoriesCount[ex.categoria] || 0) + 1;
});
console.log('Exercises count by category:', categoriesCount);
