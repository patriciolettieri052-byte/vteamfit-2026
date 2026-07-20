const fs = require('fs');
const path = 'C:/Users/59892/Desktop/VTeamfit/REPAIR/exercises_rows (4).json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const replacements = {
  'Bajá': 'Bajar',
  'Cerrá': 'Cerrar',
  'Controlá': 'Controlar',
  'Elevá': 'Elevar',
  'Empezá': 'Empezar',
  'Empujá': 'Empujar',
  'Estirá': 'Estirar',
  'Incliná': 'Inclinar',
  'Llevá': 'Llevar',
  'Mantené': 'Mantener',
  'Practicá': 'Practicar',
  'Realizá': 'Realizar',
  'Saltá': 'Saltar',
  'Sostené': 'Sostener',
  'Subí': 'Subir',
  'Usá': 'Usar',
  'Abrí': 'Abrir',
  'Activá': 'Activar',
  'Caminá': 'Caminar',
  'Explotá': 'Explotar',
  'Extendé': 'Extender',
  'Flexioná': 'Flexionar',
  'Girá': 'Girar',
  'Tirá': 'Tirar',
  'Volvé': 'Volver',
  'Dá': 'Dar',
  'abrí': 'abrir',
  'activá': 'activar',
  'bajá': 'bajar',
  'caminá': 'caminar',
  'controlá': 'controlar',
  'elevá': 'elevar',
  'empujá': 'empujar',
  'estirá': 'estirar',
  'explotá': 'explotar',
  'extendé': 'extender',
  'flexioná': 'flexionar',
  'girá': 'girar',
  'incliná': 'inclinar',
  'llevá': 'llevar',
  'realizá': 'realizar',
  'saltá': 'saltar',
  'subí': 'subir',
  'tirá': 'tirar',
  'volvé': 'volver',
  'dá': 'dar'
};

let modifiedCount = 0;

data.forEach(item => {
  if (item.description_es) {
    let newDesc = item.description_es;
    
    for (const [voseo, neutro] of Object.entries(replacements)) {
      // Usar lookbehinds y lookaheads para simular word boundaries seguros para caracteres con acento
      const regex = new RegExp(`(?<=^|[^a-zA-ZáéíóúÁÉÍÓÚñÑ])${voseo}(?=[^a-zA-ZáéíóúÁÉÍÓÚñÑ]|$)`, 'g');
      newDesc = newDesc.replace(regex, neutro);
    }
    
    if (newDesc !== item.description_es) {
      item.description_es = newDesc;
      modifiedCount++;
    }
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));

console.log(`Successfully updated ${modifiedCount} exercises to neutral Spanish.`);
