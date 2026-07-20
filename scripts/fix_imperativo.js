const fs = require('fs');
const path = 'C:/Users/59892/Desktop/VTeamfit/REPAIR/exercises_rows (4).json';

const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const replacementsUpper = {
  'Practicar': 'Practica',
  'Mantener': 'Mantén',
  'Controlar': 'Controla',
  'Realizar': 'Realiza',
  'Subir': 'Sube',
  'Bajar': 'Baja',
  'Activar': 'Activa',
  'Flexionar': 'Flexiona',
  'Tirar': 'Tira',
  'Empujar': 'Empuja',
  'Dar': 'Da',
  'Volver': 'Vuelve',
  'Cerrar': 'Cierra',
  'Elevar': 'Eleva',
  'Estirar': 'Estira',
  'Sostener': 'Sostén',
  'Abrir': 'Abre',
  'Llevar': 'Lleva',
  'Inclinar': 'Inclina',
  'Empezar': 'Empieza',
  'Apoyar': 'Apoya',
  'Caminar': 'Camina',
  'Explotar': 'Explota',
  'Extender': 'Extiende',
  'Girar': 'Gira',
  'Usar': 'Usa',
  'Aplicar': 'Aplica'
};

const replacementsLower = {
  'practicar': 'practica',
  'mantener': 'mantén',
  'controlar': 'controla',
  'realizar': 'realiza',
  'subir': 'sube',
  'bajar': 'baja',
  'activar': 'activa',
  'flexionar': 'flexiona',
  'tirar': 'tira',
  'empujar': 'empuja',
  'dar': 'da',
  'volver': 'vuelve',
  'cerrar': 'cierra',
  'elevar': 'eleva',
  'estirar': 'estira',
  'sostener': 'sostén',
  'abrir': 'abre',
  'llevar': 'lleva',
  'inclinar': 'inclina',
  'empezar': 'empieza',
  'apoyar': 'apoya',
  'caminar': 'camina',
  'explotar': 'explota',
  'extender': 'extiende',
  'girar': 'gira',
  'usar': 'usa',
  'aplicar': 'aplica'
};

let modifiedCount = 0;

data.forEach(item => {
  if (item.description_es) {
    let newDesc = item.description_es;

    // Reemplazar mayúsculas al inicio de oración
    for (const [inf, imp] of Object.entries(replacementsUpper)) {
      const regex = new RegExp(`(?<=^|[.?!]\\s+)${inf}(?=\\b)`, 'g');
      newDesc = newDesc.replace(regex, imp);
    }

    // Reemplazar minúsculas después de coma, ' y ' o al inicio (si alguna quedó minúscula)
    for (const [inf, imp] of Object.entries(replacementsLower)) {
      const regex = new RegExp(`(?<=,\\s+|\\s+y\\s+)${inf}(?=\\b)`, 'g');
      newDesc = newDesc.replace(regex, imp);
    }

    if (newDesc !== item.description_es) {
      item.description_es = newDesc;
      modifiedCount++;
    }
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));

console.log(`Successfully updated ${modifiedCount} exercises to imperative (tú) Spanish.`);
