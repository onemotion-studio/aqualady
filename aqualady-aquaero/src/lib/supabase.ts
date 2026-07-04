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
    // Upsert: РµСЃР»Рё Р·Р°РїРёСЃСЊ СЃСѓС‰РµСЃС‚РІСѓРµС‚ вЂ” РѕР±РЅРѕРІР»СЏРµРј, РёРЅР°С‡Рµ РІСЃС‚Р°РІР»СЏРµРј
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
  id: number
  user_id?: string | null
  pool_id: string
  date: string
  time: string
  quantity: number
  email?: string
  name?: string
}

export async function loadBookingsFromServer(): Promise<BookingRow[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, user_id, pool_id, date, time, quantity, email, name')
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load bookings:', e)
    return []
  }
}

export async function addBookingToServer(poolId: string, date: string, time: string, quantity: number, email?: string, name?: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('bookings')
      .insert({ pool_id: poolId, date, time, quantity, email: email || '', name: name || '' })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to add booking:', e)
    return false
  }
}

export async function linkBookingsToUser(email: string, userId: string) {
  if (!supabase) return
  try {
    await supabase
      .from('bookings')
      .update({ user_id: userId })
      .eq('email', email)
      .is('user_id', null)
  } catch (e) {
    console.error('Failed to link bookings:', e)
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


// --- Promocodes ---

export interface PromocodeRow {
  id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number
  used_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
  pool_id?: string | null
  date?: string | null
  time_slot?: string | null
  min_quantity?: number | null
}

export async function loadPromocodesFromServer(): Promise<PromocodeRow[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('promocodes')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load promocodes:', e)
    return []
  }
}

export async function savePromocodeToServer(promocode: Omit<PromocodeRow, 'created_at'>) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('promocodes')
      .upsert(
        { ...promocode, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      )
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to save promocode:', e)
    return false
  }
}

export async function deletePromocodeFromServer(id: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('promocodes')
      .delete()
      .match({ id })
    if (error) throw error
    return true
  } catch (e) {
        console.error('Failed to delete promocode:', e)
    return false
  }
}


// --- Subscription Templates ---

export interface SubscriptionTemplate {
  id: string
  name: string
  pool_id: string
  total_classes: number
  price: number
  days_of_week: number[] // 0=mon, 1=tue, ... 6=sun (ISO)
  time_slots: string[]
  is_active: boolean
  created_at: string
}

export async function loadTemplatesFromServer(): Promise<SubscriptionTemplate[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('subscription_templates')
      .select('*')
      .order('name')
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load templates:', e)
    return []
  }
}

export async function saveTemplateToServer(template: Omit<SubscriptionTemplate, 'created_at'>) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('subscription_templates')
      .upsert(template, { onConflict: 'id' })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to save template:', e)
    return false
  }
}

export async function deleteTemplateFromServer(id: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('subscription_templates')
      .delete()
      .match({ id })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to delete template:', e)
    return false
  }
}

// --- Subscriptions (monthly) ---

export interface Subscription {
  id: string
  template_id: string
  pool_id: string
  month: number
  year: number
  price: number
  total_classes: number
  dates: string[]
  time_slot: string
  is_published: boolean
  expires_at: string | null
  created_at: string
}

export async function loadSubscriptionsFromServer(): Promise<Subscription[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load subscriptions:', e)
    return []
  }
}

export async function saveSubscriptionToServer(sub: Omit<Subscription, 'created_at'>) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('subscriptions')
      .upsert(sub, { onConflict: 'id' })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to save subscription:', e)
    return false
  }
}

export async function deleteSubscriptionFromServer(id: string) {
  if (!supabase) return false
  try {
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .match({ id })
    if (error) throw error
    return true
  } catch (e) {
    console.error('Failed to delete subscription:', e)
    return false
  }
}

// --- Subscription Purchases ---

export interface SubscriptionPurchase {
  id: string
  subscription_id: string
  user_email: string
  user_name: string
  promo_code: string | null
  promo_discount: number
  final_price: number
  purchased_at: string
}

export async function addSubscriptionPurchase(purchase: Omit<SubscriptionPurchase, 'id' | 'purchased_at'>) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('subscription_purchases')
      .insert({
        ...purchase,
        id: 'sub_purchase_' + Date.now(),
        purchased_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (error) throw error
    return data?.id || null
  } catch (e) {
    console.error('Failed to add subscription purchase:', e)
    return null
  }
}

export async function loadSubscriptionPurchases(): Promise<SubscriptionPurchase[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('subscription_purchases')
      .select('*')
      .order('purchased_at', { ascending: false })
    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Failed to load subscription purchases:', e)
    return []
  }
}

// --- Pool names helper (for HomePage) ---
export async function loadPoolNames(): Promise<Record<string, string>> {
  const pools = await loadPoolsFromServer()
  if (!pools) return {}
  const map: Record<string, string> = {}
  pools.forEach(p => { map[p.id] = p.name })
  return map
}
