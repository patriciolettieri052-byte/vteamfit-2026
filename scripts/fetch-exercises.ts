import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabaseUrl = 'https://sfbsizxoxyjfancssfbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYnNpenhveHlqZmFuY3NzZmJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg1NDM2NiwiZXhwIjoyMDkxNDMwMzY2fQ.lCnOsD2XumMLeShoXA7UaNGh4DM4faJuPZhRCxEKJm4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error, count } = await supabase
    .from('exercises')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching exercises:', error);
    return;
  }

  console.log(`Fetched ${data.length} exercises (count: ${count})`);
  
  fs.writeFileSync('loaded_exercises.json', JSON.stringify(data, null, 2));
  console.log('Saved to loaded_exercises.json');
}

main();
