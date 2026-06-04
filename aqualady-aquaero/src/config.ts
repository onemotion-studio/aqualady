export const POOLS = {
  SLONECZNY: {
    id: 'sloneczny',
    name: 'Basen S\u0142oneczny',
    address: 'ul. Marsza\u0142kowska 100, Warszawa',
    rating: 4.8,
    distance: '1,2 km',
    lat: 52.2297,
    lng: 21.0122,
  },
  FALA: {
    id: 'fala',
    name: 'Basen Fala',
    address: 'ul. Wa\u0142 Miedzeszy\u0144ski 389, Warszawa',
    rating: 4.6,
    distance: '3,5 km',
    lat: 52.2112,
    lng: 21.0522,
  },
} as const

export type PoolId = keyof typeof POOLS

export interface CartItem {
  id: string
  poolId: PoolId
  type: 'single' | 'pass8' | 'pass12' | 'pass16'
  label: string
  date?: string
  time?: 'morning' | 'evening'
  price: number
}

export const PRICES = {
  single: 25,
  pass8: 299,
  pass12: 399,
  pass16: 549,
} as const

export const MONTHS_PL = [
  'Stycze\u0144', 'Luty', 'Marzec', 'Kwiecie\u0144', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpie\u0144', 'Wrzesie\u0144', 'Pa\u017Adziernik', 'Listopad', 'Grudzie\u0144'
] as const

export const DAYS_PL = ['Pn', 'Wt', '\u015Ar', 'Cz', 'Pt', 'Sb', 'Nd'] as const
