import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PoolId } from '../config'
import { loadScheduleFromServer, saveScheduleToServer, deleteScheduleFromServer } from '../lib/supabase'

export interface TimeSlotDef {
  time: string
  label: string
  value: string
  capacity?: number
}

export interface ScheduleEntry {
  poolId: PoolId
  date: string
  slots: TimeSlotDef[]
}

interface ScheduleContextValue {
  schedule: ScheduleEntry[]
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleEntry[]>>
  getSlotsForDate: (poolId: PoolId, date: string) => TimeSlotDef[]
  getScheduleForPool: (poolId: PoolId) => ScheduleEntry[]
  saveSchedule: (poolId: PoolId, date: string, slots: TimeSlotDef[]) => void
  serverConnected: boolean
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

const STORAGE_KEY = 'aqualady_schedule'

function loadFromStorage(): ScheduleEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveToStorage(data: ScheduleEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(loadFromStorage)
  const [serverConnected, setServerConnected] = useState(false)

  // Load from server on mount
  useEffect(() => {
    loadScheduleFromServer().then(serverData => {
      if (serverData && Array.isArray(serverData) && serverData.length > 0) {
        const mapped: ScheduleEntry[] = serverData.map((row: any) => ({
          poolId: row.pool_id,
          date: row.date,
          slots: typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots || [],
        }))
        setSchedule(mapped)
        saveToStorage(mapped)
        setServerConnected(true)
      }
    }).catch(() => {
      // Server not available, use local
    })
  }, [])

  // Persist to localStorage
  useEffect(() => {
    saveToStorage(schedule)
  }, [schedule])

  const getSlotsForDate = useCallback((poolId: PoolId, date: string): TimeSlotDef[] => {
    const entry = schedule.find(s => s.poolId === poolId && s.date === date)
    return entry ? entry.slots : []
  }, [schedule])

  const getScheduleForPool = useCallback((poolId: PoolId): ScheduleEntry[] => {
    return schedule.filter(s => s.poolId === poolId)
  }, [schedule])

  const saveSchedule = useCallback((poolId: PoolId, date: string, slots: TimeSlotDef[]) => {
    setSchedule(prev => {
      const idx = prev.findIndex(s => s.poolId === poolId && s.date === date)
      let next: ScheduleEntry[]
      if (idx >= 0) {
        next = [...prev]
        if (slots.length === 0) {
          next.splice(idx, 1)
          deleteScheduleFromServer(poolId, date)
        } else {
          next[idx] = { poolId, date, slots }
          saveScheduleToServer(poolId, date, slots)
        }
      } else {
        if (slots.length === 0) return prev
        next = [...prev, { poolId, date, slots }]
        saveScheduleToServer(poolId, date, slots)
      }
      return next
    })
  }, [])

  return (
    <ScheduleContext.Provider value={{ schedule, setSchedule, getSlotsForDate, getScheduleForPool, saveSchedule, serverConnected }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider')
  return ctx
}
