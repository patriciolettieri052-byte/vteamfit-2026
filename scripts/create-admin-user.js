/**
 * Script para crear el usuario admin/tester de VTeamFit.
 *
 * Características del usuario:
 *   - is_tester = true → bypasea restricción de semanas en el dashboard
 *   - onboarding_complete = true → entra directo al dashboard
 *   - Todos los planes asignados con expires_at = 2099-12-31
 *
 * Ejecutar con:
 *   node scripts/create-admin-user.js
 *
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.local
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Cargar variables de entorno desde .env.local (mismo patrón que check_cols.js)
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim().replace(/\r$/, '').replace(/^["']|["']$/g, '');
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Usar service_role — SOLO en scripts de servidor, nunca en el browser
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const EMAIL = 'admin@vteamfit.com';
const PASSWORD = 'VTeamFit2026!';

async function createAdminUser() {
  console.log('🔧 Iniciando creación de usuario admin...\n');

  // 1. Verificar si el usuario ya existe
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers && existingUsers.users
    ? existingUsers.users.find(u => u.email === EMAIL)
    : null;

  let userId;

  if (existingUser) {
    console.log(`⚠️  El usuario ${EMAIL} ya existe. Reutilizando ID: ${existingUser.id}`);
    userId = existingUser.id;
  } else {
    // 2. Crear usuario en Auth con email confirmado
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Error al crear usuario en Auth:', authError.message);
      process.exit(1);
    }

    userId = authData.user.id;
    console.log(`✅ Usuario Auth creado: ${userId}`);
  }

  // 3. Crear/actualizar perfil con is_tester = true
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      name: 'Admin VTeamFit',
      onboarding_complete: true,
      is_tester: true,
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('❌ Error al crear perfil:', profileError.message);
    process.exit(1);
  }
  console.log('✅ Perfil creado con is_tester = true');

  // 4. Obtener todos los planes disponibles
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('id, slug');

  if (plansError || !plans || plans.length === 0) {
    console.error('❌ No se pudieron obtener los planes:', plansError ? plansError.message : 'Sin planes en DB');
    process.exit(1);
  }

  console.log(`\n📋 Planes encontrados: ${plans.length}`);

  // 5. Asignar todos los planes sin vencimiento (2099)
  for (const plan of plans) {
    // Verificar si ya tiene este plan asignado
    const { data: existing } = await supabase
      .from('user_plans')
      .select('id')
      .eq('user_id', userId)
      .eq('plan_id', plan.id)
      .maybeSingle();

    if (existing) {
      // Actualizar para asegurar que esté activo y con fecha extendida
      await supabase
        .from('user_plans')
        .update({
          status: 'active',
          expires_at: new Date('2099-12-31').toISOString(),
        })
        .eq('id', existing.id);
      console.log(`   ↻  Plan actualizado: ${plan.slug}`);
    } else {
      const { error: insertError } = await supabase
        .from('user_plans')
        .insert({
          user_id: userId,
          plan_id: plan.id,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date('2099-12-31').toISOString(),
        });

      if (insertError) {
        console.error(`   ❌ Error al asignar ${plan.slug}:`, insertError.message);
      } else {
        console.log(`   ✅ Plan asignado: ${plan.slug}`);
      }
    }
  }

  console.log('\n════════════════════════════════════════');
  console.log('✅ Usuario admin listo:');
  console.log(`   Email:     ${EMAIL}`);
  console.log(`   Password:  ${PASSWORD}`);
  console.log(`   is_tester: true`);
  console.log(`   Onboarding: completo`);
  console.log(`   Planes:    ${plans.length} activos hasta 2099-12-31`);
  console.log('════════════════════════════════════════\n');
}

createAdminUser().catch(err => {
  console.error('❌ Error inesperado:', err);
  process.exit(1);
});
