import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { PoolId } from '../config'

export interface TimeSlotDef {
  time: string
  label: string
  value: string
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

  useEffect(() => {
    saveToStorage(schedule)
  }, [schedule])

  const getSlotsForDate = (poolId: PoolId, date: string): TimeSlotDef[] => {
    const entry = schedule.find(s => s.poolId === poolId && s.date === date)
    return entry ? entry.slots : []
  }

  const getScheduleForPool = (poolId: PoolId): ScheduleEntry[] => {
    return schedule.filter(s => s.poolId === poolId)
  }

  const saveSchedule = (poolId: PoolId, date: string, slots: TimeSlotDef[]) => {
    setSchedule(prev => {
      const idx = prev.findIndex(s => s.poolId === poolId && s.date === date)
      if (idx >= 0) {
        const next = [...prev]
        if (slots.length === 0) {
          next.splice(idx, 1)
        } else {
          next[idx] = { poolId, date, slots }
        }
        return next
      }
      if (slots.length === 0) return prev
      return [...prev, { poolId, date, slots }]
    })
  }

  return (
    <ScheduleContext.Provider value={{ schedule, setSchedule, getSlotsForDate, getScheduleForPool, saveSchedule }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider')
  return ctx
}
