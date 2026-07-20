const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function scan() {
  const { data: exercises } = await supabase.from('exercises').select('id, slug, name_es').order('name_es', { ascending: true });

  console.log(`Auditing all ${exercises.length} exercises in Supabase:`);

  const typosFound = [];

  exercises.forEach(ex => {
    let name = ex.name_es;
    let fixed = name
      .replace(/\bActicacion\b/gi, 'Activación')
      .replace(/\bacticación\b/gi, 'activación')
      .replace(/\bacticacion\b/gi, 'activación')
      .replace(/\bCalentamienmto\b/gi, 'Calentamiento')
      .replace(/\bSaltón\b/gi, 'Salto')
      .replace(/\bLaterlaes\b/gi, 'Laterales')
      .replace(/\bMancuena\b/gi, 'Mancuerna')
      .replace(/\bTren Inferir\b/gi, 'Tren Inferior')
      .replace(/\bSpreen\b/gi, 'Sprint')
      .replace(/\bReves\b/gi, 'Revés')
      .replace(/\bEstaticas\b/gi, 'Estáticas')
      .replace(/\bEstatica\b/gi, 'Estática')
      .replace(/\bAereas\b/gi, 'Aéreas')
      .replace(/\bCajon\b/gi, 'Cajón')
      .replace(/\bMaquiana\b/gi, 'Máquina')
      .replace(/\bMaquina\b/gi, 'Máquina')
      .replace(/\bPiernsa\b/gi, 'Piernas')
      .replace(/\bEsquilibrio\b/gi, 'Equilibrio')
      .replace(/\bAdutores\b/gi, 'Aductores')
      .replace(/\bGolde\b/gi, 'Golpe')
      .replace(/\bDercha\b/gi, 'Derecha')
      .replace(/\bDederecha\b/gi, 'Derecha')
      .replace(/\bDesplazaminetos\b/gi, 'Desplazamientos')
      .replace(/\bPess\b/gi, 'Press')
      .replace(/\bFortaler\b/gi, 'Fortalecer')
      .replace(/\bEspalada\b/gi, 'Espalda');

    if (name !== fixed) {
      typosFound.push({ id: ex.id, slug: ex.slug, oldName: name, newName: fixed });
    }
  });

  console.log(`\n🚨 FOUND ${typosFound.length} TYPOS IN SUPABASE EXERCISE NAMES:\n`);
  typosFound.forEach((t, i) => {
    console.log(`${i + 1}. [${t.slug}]`);
    console.log(`   ❌ Old: "${t.oldName}"`);
    console.log(`   ✅ New: "${t.newName}"\n`);
  });
}

scan().catch(console.error);
