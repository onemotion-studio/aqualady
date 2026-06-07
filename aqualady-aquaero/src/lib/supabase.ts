import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not set. Schedule will use localStorage only.')
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function loadScheduleFromServer() {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
    if (error) throw error
    return data
  } catch (e) {
    console.error('Failed to load schedule from server:', e)
    return null
  }
}

export async function saveScheduleToServer(poolId: string, date: string, slots: any[]) {
  if (!supabase) return false
  try {
    // Upsert: если запись существует — обновляем, иначе вставляем
    const { error } = await supabase
      .from('schedule')
      .upsert(
        { pool_id: poolId, date, slots: JSON.stringify(slots) },
        { onConflict: 'pool_id, date' }
      )
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to save schedule to server:', e)
    return false
  }
}

export async function deleteScheduleFromServer(poolId: string, date: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('schedule')
      .delete()
      .match({ pool_id: poolId, date })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to delete schedule from server:', e)
    return false
  }
}
