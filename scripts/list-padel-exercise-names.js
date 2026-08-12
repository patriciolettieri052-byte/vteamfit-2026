const fs = require('fs');

const master = JSON.parse(fs.readFileSync('VTEAMFIT_MASTER.json', 'utf8'));
const padelExs = master['plan-padel'].exercises;
const activacionExs = padelExs.filter(ex => ex.categoria === 'activación');

console.log('Total activacion exercises:', activacionExs.length);
console.log('First 50 activacion exercise names:');
activacionExs.slice(0, 50).forEach((ex, i) => {
  console.log(`${i+1}. [${ex.slug}] "${ex.name_es}"`);
});
