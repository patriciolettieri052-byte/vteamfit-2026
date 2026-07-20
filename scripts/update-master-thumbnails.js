const fs = require('fs');
const path = require('path');

const masterPath = path.join(process.cwd(), 'VTEAMFIT_MASTER.json');
if (fs.existsSync(masterPath)) {
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

  const map = {
    'calentamiento-pre-partido': 'activacion-padel.jpg',
    'calentamiento-general': 'calentamiento-general.jpg',
    'circuito-1-abdominales': 'circuito-1-abdominales.jpg',
    'circuito-2-abdominales': 'circuito-2-abdominales.jpg',
    'circuito-3-abdominales': 'circuito-3-abdominales.jpg',
    'circuito-4-abdominales': 'circuito-4-abdominales.jpg',
    'circuito-5-abdominales': 'circuito-5-abdominales.jpg',
    'estiramiento': 'estiramiento.jpg'
  };

  let count = 0;
  for (const planKey in master) {
    const p = master[planKey];
    if (p.exercises) {
      p.exercises.forEach(ex => {
        if (map[ex.slug]) {
          ex.thumbnail_url = `https://vteamfitjuly2026.b-cdn.net/${map[ex.slug]}`;
          count++;
        }
      });
    }
  }

  fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
  console.log(`Updated ${count} thumbnails in VTEAMFIT_MASTER.json`);
}
