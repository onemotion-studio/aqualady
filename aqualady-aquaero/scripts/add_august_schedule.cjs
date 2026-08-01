const { createClient } = require('@supabase/supabase-js');
const url = 'https://yrkocsmphipndklgpopd.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0';
const supabase = createClient(url, key);

// Typical session types per pool
const POOL_PROGRAMS = {
  fala: [
    { time: '9:00', value: 'slot_9',   label: 'Aqua aerobik - 9:00 - 10:00', capacity: 20 },
    { time: '11:00', value: 'slot_11', label: 'Plywanie synchroniczne - 11:00 - 12:00', capacity: 10 },
    { time: '16:00', value: 'slot_16', label: 'Nauka plywania - 16:00 - 17:00', capacity: 12 },
    { time: '17:00', value: 'slot_17', label: 'Aqua fitness - 17:00 - 18:00', capacity: 20 },
  ],
  aquapark: [
    { time: '10:00', value: 'slot_10', label: 'Aqua aerobik - 10:00 - 11:00', capacity: 20 },
    { time: '16:00', value: 'slot_16', label: 'Plywanie kraulem - 16:00 - 17:00', capacity: 15 },
    { time: '18:00', value: 'slot_18', label: 'Aqua zumbo - 18:00 - 19:00', capacity: 20 },
  ],
  sloneczny: [
    { time: '9:00', value: 'slot_9',   label: 'Aqua fitness - 9:00 - 10:00', capacity: 20 },
    { time: '10:00', value: 'slot_10', label: 'Nauka plywania - 10:00 - 11:00', capacity: 12 },
    { time: '17:00', value: 'slot_17', label: 'Relaksacyjne plywanie - 17:00 - 18:00', capacity: 25 },
    { time: '18:00', value: 'slot_18', label: 'Aqua aerobik - 18:00 - 19:00', capacity: 20 },
  ],
  wodnik: [
    { time: '16:00', value: 'slot_16', label: 'Aqua aerobik - 16:00 - 17:00', capacity: 15 },
    { time: '17:00', value: 'slot_17', label: 'Plywanie doskonalace - 17:00 - 18:00', capacity: 15 },
    { time: '18:00', value: 'slot_18', label: 'Aqua fitness - 18:00 - 19:00', capacity: 12 },
    { time: '19:00', value: 'slot_19', label: 'Relaksacyjne plywanie - 19:00 - 20:00', capacity: 10 },
  ],
};

// ISO day of week type per pool (0 = Mon ... 6 = Sun)
const POOL_DAYS = {
  fala:     [0, 2, 4], // pon, sro, pt
  aquapark: [1, 3, 5], // wt, czw, sb
  sloneczny:[0, 3],     // pon, czw
  wodnik:   [1, 2, 4],  // wt, sro, pt
};

function pad(n) { return String(n).padStart(2, '0'); }

async function main() {
  // 1. Get existing pools
  const { data: pools } = await supabase.from('pools').select('id, name');
  if (!pools || pools.length === 0) { console.log('No pools'); return; }
  const poolIds = pools.map(p => p.id);
  console.log('Pools:', poolIds.join(', '));

  // 2. Gather dates already existing in august 2026 schedule to avoid duplicates
  const { data: existing } = await supabase.from('schedule').select('pool_id, date').like('date', '2026-08-%');
  const existingSet = new Set((existing || []).map(r => `${r.pool_id}__${r.date}`));
  console.log('Existing august schedule entries:', existingSet.size);

  // 3. Build all records for August 2026
  const records = [];
  const year = 2026, month = 8; // August
  const daysInMonth = new Date(year, month, 0).getDate();

  for (const pool of pools) {
    const program = POOL_PROGRAMS[pool.id];
    const dayTypes = POOL_DAYS[pool.id];
    if (!program || !dayTypes) continue;

    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month - 1, d);
      const isoDay = (dt.getDay() + 6) % 7; // 0=Mon...6=Sun
      if (!dayTypes.includes(isoDay)) continue;

      const date = `${year}-${pad(month)}-${pad(d)}`;
      if (existingSet.has(`${pool.id}__${date}`)) continue; // skip existing

      records.push({
        pool_id: pool.id,
        date: date,
        slots: JSON.stringify(program),
      });
    }
  }

  console.log('Will insert', records.length, 'schedule records');

  // 4. Insert (Schedule has no unique constraint on pool+date, inserts are fine)
  let inserted = 0, failed = 0;
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    const { error } = await supabase.from('schedule').insert(batch);
    if (error) { console.log('Batch error:', error.message); failed += batch.length; }
    else { inserted += batch.length; }
  }

  console.log(`Done. Inserted: ${inserted}, failed: ${failed}`);

  // Verify
  const { data: verify } = await supabase.from('schedule').select('count', { count: 'exact' }).like('date', '2026-08-%');
  console.log(`Total august schedule rows now: ${verify?.[0]?.count ?? 0}`);
}

main().catch(console.error);
