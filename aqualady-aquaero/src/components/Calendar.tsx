import { useState } from 'react'
import { MONTHS_PL, DAYS_PL } from '../config'

export interface TimeSlot {
  label: string
  time: string
  value: 'morning' | 'evening'
}

export interface AvailableDate {
  date: string
  slots: TimeSlot[]
}

interface CalendarProps {
  selectedDate: string | null
  onDateSelect: (date: string) => void
  availableDates?: AvailableDate[]
  resetKey?: number
}

export default function Calendar({
  selectedDate,
  onDateSelect,
  availableDates,
  resetKey,
}: CalendarProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  const [prevKey, setPrevKey] = useState(resetKey)
  if (resetKey !== prevKey) {
    setCurrentMonth(now.getMonth())
    setCurrentYear(now.getFullYear())
    setPrevKey(resetKey)
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isPastDate = (day: number) => {
    const dateStr = formatDate(day)
    return dateStr < todayStr
  }

  const getAvailableDate = (day: number) => {
    if (!availableDates) return null
    const dateStr = formatDate(day)
    return availableDates.find(a => a.date === dateStr) || null
  }

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) week.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
      <div className="flex items-center justify-between mb-4">
        <div className="w-8" />
        <span className="text-sm font-semibold text-stone-800">{MONTHS_PL[currentMonth]} {currentYear}</span>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_PL.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-stone-400 py-1">{d}</div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="aspect-square" />
              const dateStr = formatDate(day)
              const isThisSelected = selectedDate === dateStr
              const isPast = isPastDate(day)
              const isToday = dateStr === todayStr
              const avail = getAvailableDate(day)
              const hasSlots = avail && avail.slots.length > 0

              return (
                <button
                  key={di}
                  disabled={isPast || !hasSlots}
                  onClick={() => hasSlots && onDateSelect(dateStr)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center ${
                    isPast || !hasSlots ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:bg-sand-light'
                  } ${
                    isThisSelected ? 'bg-red-accent text-white shadow-md hover:bg-red-700' : ''
                  } ${
                    isToday && !isThisSelected && hasSlots ? 'border border-teal-brand/40 text-teal-brand font-bold' : ''
                  } ${
                    !isThisSelected && !isPast && hasSlots ? 'text-stone-700' : ''
                  } ${
                    !isThisSelected && !isPast && !hasSlots ? 'text-stone-300' : ''
                  }`}
                >
                  <span>{day}</span>
                  {hasSlots && !isThisSelected && (
                    <span className="text-[6px] text-teal-brand mt-0.5 leading-none">&#8226;</span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
