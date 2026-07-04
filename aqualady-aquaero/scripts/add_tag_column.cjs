const { createClient } = require('@supabase/supabase-js');
const url = 'https://yrkocsmphipndklgpopd.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0';
const supabase = createClient(url, anonKey);

async function main() {
  // Check if tag column exists by trying to select it
  const { data: cols, error: colsErr } = await supabase.rpc('get_columns', { table_name: 'subscription_templates' });
  console.log('Columns check:', colsErr ? colsErr.message : JSON.stringify(cols));

  // Try raw SQL through the REST API
  const sql = "ALTER TABLE subscription_templates ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT ''";
  const response = await fetch(url + '/rest/v1/rpc/execute_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': anonKey,
      'Authorization': 'Bearer ' + anonKey,
    },
    body: JSON.stringify({ sql_text: sql }),
  });
  console.log('SQL response status:', response.status);
  const text = await response.text();
  console.log('SQL response:', text);
}

main().catch(console.error);
