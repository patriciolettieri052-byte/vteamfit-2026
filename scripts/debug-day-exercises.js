const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('day_exercises')
    .select('*')
    .eq('day_id', 'be282944-021a-47e8-92bd-3fec89623fe2'); // Day 4 (Thursday)

  console.log("Day 4 exercises:", data);
}

run();
