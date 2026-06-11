import { useState } from 'react'
import { MONTHS_PL, DAYS_PL } from '../config'

export interface TimeSlot {
  label: string
  time: string
  value: string
}

export interface AvailableDate {
  date: string
  slots: TimeSlot[]
  allSlotsFull?: boolean
}

interface CalendarProps {
  selectedDate: string | null
  onDateSelect: (date: string) => void
  resetKey?: number
  availableDates?: AvailableDate[]
  scheduledDates?: string[]
}

export default function Calendar({ selectedDate, onDateSelect, resetKey, availableDates, scheduledDates }: CalendarProps) {
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

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const scheduledSet = scheduledDates ? new Set(scheduledDates) : null

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isPastDate = (day: number) => formatDate(day) < todayStr

  const getAvailableDate = (day: number) => {
    if (!availableDates) return null
    return availableDates.find(a => a.date === formatDate(day)) || null
  }

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) week.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }

    return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-sand/20 max-w-md mx-auto sm:max-w-none">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <button onClick={prevMonth} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="text-sm sm:text-base lg:text-lg font-semibold text-stone-800">{MONTHS_PL[currentMonth]} {currentYear}</span>
        <button onClick={nextMonth} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
        {DAYS_PL.map(d => (
          <div key={d} className="text-center text-[10px] sm:text-[11px] lg:text-xs font-medium text-stone-400 py-0.5 sm:py-1">{d}</div>
        ))}
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {week.map((day, di) => {
              if (day === null) return <div key={di} className="aspect-square" />
              const dateStr = formatDate(day)
              const isSelected = selectedDate === dateStr
              const isPast = isPastDate(day)
              const isToday = dateStr === todayStr
              const avail = getAvailableDate(day)
              const hasSlots = avail && avail.slots.length > 0
              const isScheduled = scheduledSet ? scheduledSet.has(dateStr) : false
              const isClickable = !isPast && (isScheduled || hasSlots)

              return (
                <button
                  key={di}
                  disabled={!isClickable}
                  onClick={() => isClickable && onDateSelect(dateStr)}
                  className={`aspect-square rounded-lg text-[11px] sm:text-xs lg:text-sm font-medium transition-all flex flex-col items-center justify-center relative ${
                    !isClickable ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:bg-sand-light'
                  } ${
                    isSelected ? 'bg-red-accent text-white shadow-md hover:bg-red-700' : ''
                  } ${
                    isScheduled && !isSelected ? 'bg-teal-brand/15 text-teal-brand font-bold' : ''
                  } ${
                    avail?.allSlotsFull && !isSelected ? 'bg-stone-200 text-stone-400 border border-stone-200 font-medium' : ''
                  } ${
                    isToday && !isSelected && !isScheduled && !hasSlots ? 'border border-teal-brand/40 text-teal-brand font-bold' : ''
                  } ${
                    !isSelected && !isPast && !isScheduled && !hasSlots && !isToday ? 'text-stone-300' : ''
                  } ${
                    !isSelected && !isPast && isScheduled ? 'text-teal-brand font-bold' : ''
                  }`}
                >
                  <span>{day}</span>
                  {isScheduled && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-teal-brand" />
                  )}
                  {hasSlots && !isScheduled && !isSelected && (
                    <span className="text-[6px] sm:text-[8px] text-teal-brand mt-0.5 leading-none">&bull;</span>
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
