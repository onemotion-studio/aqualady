export const BUILTIN_POOLS = {
  SLONECZNY: {
    id: 'sloneczny',
    name: 'Basen Sloneczny',
    address: 'ul. Marszalkowska 100, Warszawa',
    rating: 4.8,
    distance: '1,2 km',
    lat: 52.2297,
    lng: 21.0122,
  },
  FALA: {
    id: 'fala',
    name: 'Basen Fala',
    address: 'ul. Wal Miedzeszynski 389, Warszawa',
    rating: 4.6,
    distance: '3,5 km',
    lat: 52.2112,
    lng: 21.0522,
  },
} as const

export type PoolId = string

export interface PoolConfig {
  id: string
  name: string
  address: string
  rating: number
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

export function loadPools(): Record<string, PoolConfig> {
  try {
    const raw = localStorage.getItem(POOLS_STORAGE_KEY)
    const custom = raw ? JSON.parse(raw) : {}
    return { ...BUILTIN_POOLS, ...custom }
  } catch {
    return { ...BUILTIN_POOLS }
  }
}

export function saveCustomPool(pool: PoolConfig) {
  try {
    const raw = localStorage.getItem(POOLS_STORAGE_KEY)
    const custom = raw ? JSON.parse(raw) : {}
    custom[pool.id] = pool
    localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(custom))
  } catch {}
}

export function removeCustomPool(poolId: string) {
  try {
    const raw = localStorage.getItem(POOLS_STORAGE_KEY)
    if (raw) {
      const custom = JSON.parse(raw)
      delete custom[poolId]
      localStorage.setItem(POOLS_STORAGE_KEY, JSON.stringify(custom))
    }
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
