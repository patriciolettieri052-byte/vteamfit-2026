const fs = require('fs');
const path = require('path');

const master = JSON.parse(fs.readFileSync('VTEAMFIT_MASTER.json', 'utf8'));
console.log('Keys of VTEAMFIT_MASTER.json:', Object.keys(master));
if (master['plan-padel']) {
  console.log('plan-padel keys:', Object.keys(master['plan-padel']));
  if (master['plan-padel'].exercises) {
    console.log('Number of exercises in plan-padel:', master['plan-padel'].exercises.length);
    console.log('Sample exercise:', master['plan-padel'].exercises[0]);
  }
}
