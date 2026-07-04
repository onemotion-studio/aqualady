const { createClient } = require('@supabase/supabase-js');
const url = 'https://yrkocsmphipndklgpopd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0';
const supabase = createClient(url, key);

async function main() {
  // 1. Get pools
  const { data: pools } = await supabase.from('pools').select('id, name');
  console.log('Existing pools:', pools);

  if (!pools || pools.length === 0) {
    console.log('No pools found, please create pools first');
    return;
  }

  // 2. Get existing templates to avoid duplicates
  const { data: existingTmpls } = await supabase.from('subscription_templates').select('id, name');
  const existingNames = new Set((existingTmpls || []).map(t => t.name));
  console.log('Existing template names:', [...existingNames]);

  // 3. Delete old subscriptions and templates (for clean seed)
  // First delete subscriptions since they reference templates
  const { error: delSubErr } = await supabase.from('subscriptions').delete().neq('id', 'x');
  if (delSubErr) console.log('Delete subs error:', delSubErr.message);
  else console.log('Deleted existing subscriptions');

  const { error: delTmplErr } = await supabase.from('subscription_templates').delete().neq('id', 'x');
  if (delTmplErr) console.log('Delete tmpls error:', delTmplErr.message);
  else console.log('Deleted existing templates');

  // 4. Create templates for each pool
  const templates = [];
  
  // Template 1: 8 classes - basic (for each pool)
  // Template 2: 12 classes - popular (for each pool)
  
  const templatesData = [
    { name: '8 zajęć podstawowy', total_classes: 8, price: 249, days_of_week: [0, 2, 4], time_slots: ['slot_0900', 'slot_1030'], is_active: true },
    { name: '12 zajęć popularny', total_classes: 12, price: 349, days_of_week: [0, 1, 2, 3, 4], time_slots: ['slot_0900', 'slot_1030', 'slot_1200'], is_active: true },
    { name: 'Bezlimit', total_classes: 30, price: 549, days_of_week: [0, 1, 2, 3, 4, 5, 6], time_slots: ['slot_0900', 'slot_1030', 'slot_1200'], is_active: true },
  ];

  for (const pool of pools) {
    for (const tmpl of templatesData) {
      const id = `tmpl_${pool.id}_${tmpl.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      templates.push({
        id,
        name: `${tmpl.name} - ${pool.name}`,
        pool_id: pool.id,
        total_classes: tmpl.total_classes,
        price: tmpl.price,
        days_of_week: tmpl.days_of_week,
        time_slots: tmpl.time_slots,
        is_active: true,
      });
    }
  }

  // Insert templates
  const { error: insertTmplErr } = await supabase.from('subscription_templates').upsert(templates, { onConflict: 'id' });
  if (insertTmplErr) {
    console.log('Insert templates error:', insertTmplErr.message);
    return;
  }
  console.log(`Inserted ${templates.length} templates`);

  // 5. Generate subscriptions for next 3 months
  const now = new Date();
  const subscriptions = [];
  
  for (const tmpl of templates) {
    for (let m = 1; m <= 3; m++) {
      const month = now.getMonth() + m;
      const year = now.getFullYear() + (month > 12 ? 1 : 0);
      const mo = month > 12 ? month - 12 : month;
      
      // Generate dates based on days_of_week
      const dates = [];
      const daysInM = new Date(year, mo, 0).getDate();
      const firstDate = new Date(year, mo - 1, 1);
      
      for (let d = 1; d <= daysInM; d++) {
        const dt = new Date(year, mo - 1, d);
        // Convert JS getDay() (0=Sun, 6=Sat) to ISO (0=Mon, 6=Sun)
        const isoDay = (dt.getDay() + 6) % 7;
        if (tmpl.days_of_week.includes(isoDay)) {
          dates.push(`${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }
      }

      if (dates.length === 0) continue;

      // Expires at: day before first date at end of day
      const firstDateStr = dates[0] + 'T00:00:00';
      const fd = new Date(firstDateStr);
      fd.setDate(fd.getDate() - 1);
      fd.setHours(23, 59, 59);
      const expiresAt = fd.toISOString();

      const subId = `sub_${tmpl.pool_id}_${tmpl.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${mo}_${year}`;
      
      subscriptions.push({
        id: subId,
        template_id: tmpl.id,
        pool_id: tmpl.pool_id,
        month: mo,
        year: year,
        price: tmpl.price,
        total_classes: tmpl.total_classes,
        dates: dates,
        time_slot: tmpl.time_slots[0] || 'slot_0900',
        is_published: true,
        expires_at: expiresAt,
      });
    }
  }

  // Insert subscriptions in batches of 10
  for (let i = 0; i < subscriptions.length; i += 10) {
    const batch = subscriptions.slice(i, i + 10);
    const { error: insertSubErr } = await supabase.from('subscriptions').upsert(batch, { onConflict: 'id' });
    if (insertSubErr) {
      console.log(`Insert subs batch ${i} error:`, insertSubErr.message);
    } else {
      console.log(`Inserted subscriptions batch ${i / 10 + 1} (${batch.length} items)`);
    }
  }

  console.log(`\nDone! Created ${templates.length} templates and ${subscriptions.length} subscriptions`);

  // Verify
  const { data: verifyTmpls } = await supabase.from('subscription_templates').select('count', { count: 'exact' });
  const { data: verifySubs } = await supabase.from('subscriptions').select('count', { count: 'exact' });
  console.log(`Verified: ${verifyTmpls?.[0]?.count || 0} templates, ${verifySubs?.[0]?.count || 0} subscriptions`);
}

main().catch(console.error);
