const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: plans } = await supabase.from('plans').select('id, name_es, slug');
  if (!plans || plans.length === 0) return;
  const plan = plans[0]; // TRANSFORMA TU CUERPO

  const { data: weeks } = await supabase
    .from('weeks')
    .select(`
      id,
      week_number,
      days (
        id,
        day_number,
        is_rest_day,
        title
      )
    `)
    .eq('plan_id', plan.id)
    .order('week_number', { ascending: true })
    .limit(1);

  console.log(JSON.stringify(weeks[0].days, null, 2));
}

run();
