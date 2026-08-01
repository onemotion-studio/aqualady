const { createClient } = require('@supabase/supabase-js');
const url = 'https://yrkocsmphipndklgpopd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0';
const supabase = createClient(url, key);

async function main() {
  const { data: pools, error: e1 } = await supabase.from('pools').select('*');
  console.log('POOLS:', JSON.stringify(pools, null, 2));
  if (e1) console.log('e1', e1.message);

  const { data: sched, error: e2 } = await supabase.from('schedule').select('*').limit(20);
  console.log('SCHEDULE sample:', JSON.stringify(sched, null, 2));
  if (e2) console.log('e2', e2.message);

  const { data: tmpls } = await supabase.from('subscription_templates').select('id, name, pool_id');
  console.log('TEMPLATES:', JSON.stringify(tmpls, null, 2));

  const { data: subs } = await supabase.from('subscriptions').select('id, template_id, pool_id, month, year');
  console.log('SUBSCRIPTIONS:', JSON.stringify(subs, null, 2));
}
main().catch(console.error);
