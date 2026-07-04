const { createClient } = require('@supabase/supabase-js');
const url = 'https://yrkocsmphipndklgpopd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0';
const supabase = createClient(url, anonKey);

async function main() {
  // We can't add columns via anon key. Let's check if the column already exists
  // by selecting all data with a raw query
  const { data, error } = await supabase.from('subscription_templates').select('*').limit(1);
  if (error) { console.log('Error:', error.message); return; }
  console.log('First row keys:', Object.keys(data[0] || {}));
  
  // If 'tag' is already there from a previous failed migration, try to get it
  if (data && data[0] && 'tag' in data[0]) {
    console.log('tag column EXISTS in response!');
  } else {
    console.log('tag column NOT in response');
    console.log('You need to add it via Supabase Dashboard:');
    console.log('1. Go to https://supabase.com/dashboard/project/yrkocsmphipndklgpopd');
    console.log('2. Open SQL Editor');
    console.log('3. Run: ALTER TABLE subscription_templates ADD COLUMN tag TEXT DEFAULT \'\';');
    console.log('4. Run: UPDATE subscription_templates SET tag = CASE');
    console.log('     WHEN name LIKE \'%podstawowy%\' THEN \'podstawowy\'');
    console.log('     WHEN name LIKE \'%popularny%\' THEN \'popularny\'');
    console.log('     WHEN name LIKE \'%Bezlimit%\' THEN \'bezlimit\'');
    console.log('     ELSE \'\' END;');
  }
}

main().catch(console.error);
