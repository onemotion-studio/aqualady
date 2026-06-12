export const BUILTIN_POOLS: Record<string, PoolConfig> = {}

export type PoolId = string

export interface PoolConfig {
  id: string
  name: string
  address: string
  temp: number
  distance: string
  lat: number
  lng: number
}

export interface CartItem {
  id: string
  poolId: PoolId
  type: 'single' | 'pass8' | 'pass12' | 'pass16'
  label: string
  date?: string
  time?: string
  price: number
  quantity: number
}

export const PRICES = {
  single: 25,
  pass8: 299,
  pass12: 399,
  pass16: 549,
} as const

export const MONTHS_PL = [
  'Styczen', 'Luty', 'Marzec', 'Kwiecien', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpien', 'Wrzesien', 'Pazdziernik', 'Listopad', 'Grudzien'
] as const

export const DAYS_PL = ['Pn', 'Wt', 'Sr', 'Cz', 'Pt', 'Sb', 'Nd'] as const

const POOLS_STORAGE_KEY = 'aqualady_pools'
let cachedPools: Record<string, PoolConfig> | null = null
let poolLoadPromise: Promise<Record<string, PoolConfig>> | null = null

export async function loadPoolsAsync(): Promise<Record<string, PoolConfig>> {
  if (cachedPools) return cachedPools
  if (poolLoadPromise) return poolLoadPromise

  poolLoadPromise = (async () => {
    try {
      // Try loading from Supabase first
      const { loadPoolsFromServer } = await import('./lib/supabase')
      const serverPools = await loadPoolsFromServer()
      if (serverPools && serverPools.length > 0) {
        const result: Record<string, PoolConfig> = {}
        serverPools.forEach(p => {
          // Parse temperature from "28°C" string to number
          const tempNum = parseInt(p.temp) || 28
          result[p.id] = {
            id: p.id,
            name: p.name,
            address: p.address,
            temp: tempNum,
            distance: p.distance || '-',
            lat: p.lat,
            lng: p.lng,
          }
        })
        cachedPools = result
        // Cache in localStorage
        try { localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(result)) } catch {}
        return result
      }
    } catch {}
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(POOLS_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        cachedPools = parsed
        return parsed
      }
    } catch {}
    return {}
  })()

  const result = await poolLoadPromise
  poolLoadPromise = null
  return result
}

// Synchronous version for immediate use (localStorage only)
export function loadPools(): Record<string, PoolConfig> {
  if (cachedPools) return cachedPools
  try {
    const raw = localStorage.getItem(POOLS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Normalize temp from string to number if needed
      Object.keys(parsed).forEach(key => {
        if (typeof parsed[key].temp === 'string') {
          parsed[key].temp = parseInt(parsed[key].temp) || 28
        }
      })
      cachedPools = parsed
      return cachedPools!
    }
  } catch {}
  return {}
}

export async function saveCustomPool(pool: PoolConfig) {
  const tempStr = pool.temp + '°C'
  // Save to localStorage
  try {
    const raw = localStorage.getItem(POOLS_STORAGE_KEY)
    const custom = raw ? JSON.parse(raw) : {}
    custom[pool.id] = { ...pool, temp: tempStr }
    localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(custom))
    cachedPools = custom
  } catch {}
  // Also save to Supabase
  try {
    const { savePoolToServer } = await import('./lib/supabase')
    await savePoolToServer({
      id: pool.id,
      name: pool.name,
      address: pool.address,
      temp: tempStr,
      lat: pool.lat,
      lng: pool.lng,
    })
  } catch {}
}

export async function removeCustomPool(poolId: string) {
  // Remove from localStorage
  try {
    const raw = localStorage.getItem(POOLS_STORAGE_KEY)
    if (raw) {
      const custom = JSON.parse(raw)
      delete custom[poolId]
      localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(custom))
      cachedPools = custom
    }
  } catch {}
  // Also remove from Supabase
  try {
    const { deletePoolFromServer } = await import('./lib/supabase')
    await deletePoolFromServer(poolId)
  } catch {}
}

export const DEFAULT_SLOTS = [
  { time: '9:00', label: '9:00 - 10:00', value: 'slot_9' },
  { time: '10:00', label: '10:00 - 11:00', value: 'slot_10' },
  { time: '11:00', label: '11:00 - 12:00', value: 'slot_11' },
  { time: '16:00', label: '16:00 - 17:00', value: 'slot_16' },
  { time: '17:00', label: '17:00 - 18:00', value: 'slot_17' },
  { time: '18:00', label: '18:00 - 19:00', value: 'slot_18' },
  { time: '19:00', label: '19:00 - 20:00', value: 'slot_19' },
]
