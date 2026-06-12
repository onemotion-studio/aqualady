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


// --- Bookings ---

export interface BookingRow {
  pool_id: string
  date: string
  time: string
  quantity: number
}

export async function loadBookingsFromServer(): Promise<BookingRow[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('pool_id, date, time, quantity')
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load bookings:', e)
    return []
  }
}

export async function addBookingToServer(poolId: string, date: string, time: string, quantity: number, email?: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('bookings')
      .insert({ pool_id: poolId, date, time, quantity, email: email || '' })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to add booking:', e)
    return false
  }
}


// --- Pools ---

export interface PoolRow {
  id: string
  name: string
  address: string
  temp: string
  distance: string
  lat: number
  lng: number
  is_builtin: boolean
}

export async function loadPoolsFromServer(): Promise<PoolRow[] | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('pools')
      .select('id, name, address, temp, distance, lat, lng, is_builtin')
      .order('name')
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load pools:', e)
    return null
  }
}

export async function savePoolToServer(pool: { id: string; name: string; address: string; temp: string; lat: number; lng: number }) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('pools')
      .upsert(
        { id: pool.id, name: pool.name, address: pool.address, temp: pool.temp, lat: pool.lat, lng: pool.lng, is_builtin: false },
        { onConflict: 'id' }
      )
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to save pool:', e)
    return false
  }
}

export async function deletePoolFromServer(poolId: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('pools')
      .delete()
      .match({ id: poolId, is_builtin: false })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to delete pool:', e)
    return false
  }
}

