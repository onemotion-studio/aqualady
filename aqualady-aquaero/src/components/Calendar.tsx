import { useState } from 'react'
import { MONTHS_PL, DAYS_PL } from '../config'

interface CalendarProps {
  selectedDates: string[]
  onDateToggle: (date: string) => void
  resetKey?: number
}

export default function Calendar({ selectedDates, onDateToggle, resetKey }: CalendarProps) {
  const now = new Date()
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [currentYear, setCurrentYear] = useState(now.getFullYear())

  // Сброс месяца при изменении resetKey (смена бассейна)
  const [prevKey, setPrevKey] = useState(resetKey)
  if (resetKey !== prevKey) {
    setCurrentMonth(now.getMonth())
    setCurrentYear(now.getFullYear())
    setPrevKey(resetKey)
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  // Polish week starts on Monday: 0=Sun -> 6, 1=Mon -> 0, etc.
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

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isPastDate = (day: number) => {
    const dateStr = formatDate(day)
    return dateStr < todayStr
  }

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) {
    week.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-stone-800">
          {MONTHS_PL[currentMonth]} {currentYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_PL.map(d => (
          <div key={d} className="text-center text-[11px] font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="aspect-square" />
              const dateStr = formatDate(day)
              const isSelected = selectedDates.includes(dateStr)
              const isPast = isPastDate(day)
              const isToday = dateStr === todayStr

              return (
                <button
                  key={di}
                  disabled={isPast}
                  onClick={() => onDateToggle(dateStr)}
                  className={`aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center
                    ${isPast ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:bg-sand-light'}
                    ${isSelected ? 'bg-red-accent text-white shadow-md hover:bg-red-700' : ''}
                    ${isToday && !isSelected ? 'border border-teal-brand/40 text-teal-brand font-bold' : ''}
                    ${!isSelected && !isPast && !isToday ? 'text-stone-700' : ''}
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-3 pt-3 border-t border-sand/20">
          <p className="text-xs text-stone-500">
            Wybrane daty: <span className="font-semibold text-red-accent">{selectedDates.length}</span>
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {selectedDates.slice(0, 10).map(d => (
              <span key={d} className="text-[10px] bg-red-light text-red-accent px-2 py-0.5 rounded-full font-medium">
                {d.slice(8, 10)}.{d.slice(5, 7)}
              </span>
            ))}
            {selectedDates.length > 10 && (
              <span className="text-[10px] text-stone-400">+{selectedDates.length - 10}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
