import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MONTHS_PL, DAYS_PL, loadPools, saveCustomPool, removeCustomPool, DEFAULT_SLOTS, type PoolConfig } from '../config'
import { useSchedule, type TimeSlotDef } from '../context/ScheduleContext'

const CUSTOM_SLOTS_KEY = 'aqualady_custom_slots'

function loadCustomSlots(): TimeSlotDef[] {
  try {
    const raw = localStorage.getItem(CUSTOM_SLOTS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return [...DEFAULT_SLOTS]
}

function saveCustomSlots(slots: TimeSlotDef[]) {
  try {
    localStorage.setItem(CUSTOM_SLOTS_KEY, JSON.stringify(slots))
  } catch {}
}

interface PoolForm {
  name: string
  address: string
  lat: string
  lng: string
  rating: string
}

const emptyForm: PoolForm = { name: '', address: '', lat: '', lng: '', rating: '' }

export default function TrainerDashboard() {
  const navigate = useNavigate()
  const { schedule, saveSchedule, getScheduleForPool } = useSchedule()

  const [allPools, setAllPools] = useState<Record<string, PoolConfig>>(loadPools)
  const poolList = useMemo(() => Object.values(allPools), [allPools])
  const [activePoolId, setActivePoolId] = useState<string>(poolList[0]?.id || '')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [checkedSlots, setCheckedSlots] = useState<Set<string>>(new Set())
  const [savedMessage, setSavedMessage] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [showPoolForm, setShowPoolForm] = useState(false)
  const [editingPoolId, setEditingPoolId] = useState<string | null>(null)
  const [poolForm, setPoolForm] = useState<PoolForm>(emptyForm)
  const [customSlots, setCustomSlots] = useState<TimeSlotDef[]>(loadCustomSlots)
  const [newSlotStart, setNewSlotStart] = useState('')
  const [newSlotEnd, setNewSlotEnd] = useState('')
  const [newSlotLabel, setNewSlotLabel] = useState('')
  const [newSlotCapacity, setNewSlotCapacity] = useState('')

  // Persist custom slots
  useEffect(() => {
    saveCustomSlots(customSlots)
  }, [customSlots])

  const activePool = poolList.find(p => p.id === activePoolId)
  const poolSchedule = getScheduleForPool(activePoolId)
  const scheduledDates = useMemo(() => new Set(poolSchedule.map(s => s.date)), [poolSchedule])
  const allSlots = customSlots

  const handleDateClick = (date: string) => {
    setSelectedDate(date)
    const existing = schedule.find(s => s.poolId === activePoolId && s.date === date)
    if (existing) {
      setCheckedSlots(new Set(existing.slots.map(s => s.value)))
    } else {
      setCheckedSlots(new Set())
    }
  }

  const toggleSlot = (value: string) => {
    setCheckedSlots(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const handleSave = () => {
    if (!selectedDate) return
    const slots = allSlots.filter(s => checkedSlots.has(s.value))
    saveSchedule(activePoolId, selectedDate, slots)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  const openAddPool = () => {
    setEditingPoolId(null)
    setPoolForm(emptyForm)
    setShowPoolForm(true)
  }

  const openEditPool = () => {
    if (!activePool) return
    setEditingPoolId(activePool.id)
    setPoolForm({
      name: activePool.name,
      address: activePool.address,
      lat: String(activePool.lat),
      lng: String(activePool.lng),
      rating: String(activePool.rating),
    })
    setShowPoolForm(true)
  }

  const closePoolForm = () => {
    setShowPoolForm(false)
    setEditingPoolId(null)
    setPoolForm(emptyForm)
  }

  const handleSavePool = () => {
    const id = editingPoolId || 'custom_' + Date.now()
    const pool: PoolConfig = {
      id,
      name: poolForm.name,
      address: poolForm.address,
      rating: parseFloat(poolForm.rating) || 0,
      distance: '-',
      lat: parseFloat(poolForm.lat) || 0,
      lng: parseFloat(poolForm.lng) || 0,
    }
    saveCustomPool(pool)
    setAllPools(prev => ({ ...prev, [id]: pool }))
    setActivePoolId(id)
    closePoolForm()
  }

  const handleDeletePool = (poolId: string) => {
    if (!poolId.startsWith('custom_')) return
    removeCustomPool(poolId)
    setAllPools(prev => {
      const next = { ...prev }
      delete next[poolId]
      const keys = Object.keys(next)
      if (next[activePoolId]) {
        setActivePoolId(activePoolId)
      } else {
        setActivePoolId(keys[0] ? next[keys[0]].id : '')
      }
      return next
    })
    setSelectedDate(null)
    setCheckedSlots(new Set())
  }

  const addCustomSlot = () => {
    if (!newSlotStart || !newSlotEnd) return
    const value = 'slot_' + newSlotStart.replace(':', '')
    const defaultLabel = newSlotStart + ' - ' + newSlotEnd
    const label = newSlotLabel || defaultLabel
    const capacity = parseInt(newSlotCapacity) || 0
    setCustomSlots(prev => [...prev, { time: newSlotStart, label, value, capacity }])
    setNewSlotStart('')
    setNewSlotEnd('')
    setNewSlotLabel('')
    setNewSlotCapacity('')
  }

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const todayStr = (() => {
    const t = new Date()
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
  })()

  const formatDate = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const isPastDate = (day: number) => formatDate(day) < todayStr

  const weeks: (number | null)[][] = []
  let week: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) week.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week) }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg font-bold text-stone-800">Panel Trenera</h1>
            <p className="text-[11px] text-stone-400">Zarzadzanie zajetosciami</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-[10px] text-stone-400 underline hover:text-stone-600"
          >
            Strona glowna
          </button>
        </div>

        {/* Pool selector with actions */}
        <div className="mb-5">
          <label className="text-xs font-medium text-stone-500 mb-1.5 block">Wybierz basen:</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={activePoolId}
                onChange={e => { setActivePoolId(e.target.value); setSelectedDate(null); setCheckedSlots(new Set()) }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-sand/30 text-sm text-stone-700 focus:border-teal-brand focus:outline-none appearance-none"
              >
                {poolList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={openEditPool}
              className="px-3 py-3 rounded-xl bg-white border border-sand/30 text-stone-500 hover:border-teal-brand/40 hover:text-teal-brand transition-all"
              title="Edytuj basen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={openAddPool}
              className="px-3 py-3 rounded-xl bg-teal-brand text-white text-sm font-medium hover:bg-teal-light active:scale-[0.98] transition-all"
              title="Dodaj nowy basen"
            >
              + Nowy
            </button>
            <button
              onClick={() => handleDeletePool(activePoolId)}
              disabled={!activePoolId.startsWith('custom_')}
              className="px-3 py-3 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-medium hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Usun basen"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pool form (add / edit) */}
        {showPoolForm && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 mb-5 space-y-3">
            <p className="text-xs font-semibold text-stone-700">{editingPoolId ? 'Edytuj basen' : 'Dodaj nowy basen'}</p>
            <input
              placeholder="Nazwa basenu"
              value={poolForm.name}
              onChange={e => setPoolForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
            />
            <input
              placeholder="Adres"
              value={poolForm.address}
              onChange={e => setPoolForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
            />
            <input
              placeholder="Ocena (np. 4.5)"
              value={poolForm.rating}
              onChange={e => setPoolForm(prev => ({ ...prev, rating: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              type="number"
              step="any"
              min="0"
              max="5"
            />
            <div className="flex gap-2">
              <input
                placeholder="Szerokosc (lat)"
                value={poolForm.lat}
                onChange={e => setPoolForm(prev => ({ ...prev, lat: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
                type="number"
                step="any"
              />
              <input
                placeholder="Dlugosc (lng)"
                value={poolForm.lng}
                onChange={e => setPoolForm(prev => ({ ...prev, lng: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
                type="number"
                step="any"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSavePool}
                disabled={!poolForm.name}
                className="flex-1 py-2.5 rounded-xl bg-teal-brand text-white text-sm font-bold disabled:bg-stone-200 disabled:text-stone-400 hover:bg-teal-light active:scale-[0.98] transition-all"
              >
                {editingPoolId ? 'Zapisz zmiany' : 'Dodaj basen'}
              </button>
              <button
                onClick={closePoolForm}
                className="px-4 py-2.5 rounded-xl border border-sand/30 text-sm text-stone-500 hover:bg-stone-50 transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-semibold text-stone-800">{MONTHS_PL[currentMonth]} {currentYear}</span>
            <button
              onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
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
                  const isPast = isPastDate(day)
                  const isThisSelected = selectedDate === dateStr
                  const hasSchedule = scheduledDates.has(dateStr)
                  const isToday = dateStr === todayStr

                  return (
                    <button
                      key={di}
                      disabled={isPast}
                      onClick={() => handleDateClick(dateStr)}
                      className={`aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center relative ${
                        isPast ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:bg-sand-light'
                      } ${
                        isThisSelected ? 'bg-teal-brand text-white shadow-md' : ''
                      } ${
                        hasSchedule && !isThisSelected ? 'bg-teal-brand/15 text-teal-brand font-bold' : ''
                      } ${
                        isToday && !isThisSelected && !hasSchedule ? 'border border-teal-brand/40 text-teal-brand font-bold' : ''
                      } ${
                        !isThisSelected && !isPast && !hasSchedule && !isToday ? 'text-stone-700' : ''
                      }`}
                    >
                      <span>{day}</span>
                      {hasSchedule && !isThisSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-brand" />
                      )}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Slot checkboxes */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20 mb-4">
            <p className="text-xs font-medium text-stone-500 mb-3">
              Zajecia na dzien <span className="font-semibold text-stone-700">{selectedDate.slice(8, 10)}.{selectedDate.slice(5, 7)}.{selectedDate.slice(0, 4)}</span>
            </p>

            {/* Custom slot input */}
            <div className="flex gap-2 mb-2">
              <input
                type="time"
                value={newSlotStart}
                onChange={e => setNewSlotStart(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Poczatek"
              />
              <input
                type="time"
                value={newSlotEnd}
                onChange={e => setNewSlotEnd(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Koniec"
              />
                        </div>
            <div className="flex gap-2 mb-2">
              <input
                value={newSlotLabel}
                onChange={e => setNewSlotLabel(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Opis (opcjonalnie)"
              />
              <input
                type="number"
                min="1"
                max="99"
                value={newSlotCapacity}
                onChange={e => setNewSlotCapacity(e.target.value)}
                className="w-24 px-3 py-2.5 rounded-xl border border-sand/30 text-xs focus:border-teal-brand focus:outline-none"
                placeholder="Miejsca"
              />
            </div>
            <button
              onClick={addCustomSlot}
              disabled={!newSlotStart || !newSlotEnd}
              className="w-full py-2.5 rounded-xl bg-teal-brand text-white text-xs font-bold disabled:bg-stone-200 disabled:text-stone-400 hover:bg-teal-light transition-all mb-4"
            >
              + Dodaj
            </button>

            <div className="space-y-2">
              {allSlots.map((slot, si) => (
                <label
                  key={slot.value}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    checkedSlots.has(slot.value)
                      ? 'bg-teal-brand/10 border-teal-brand text-teal-brand'
                      : 'bg-white border-sand/30 text-stone-600 hover:border-teal-brand/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checkedSlots.has(slot.value)}
                    onChange={() => toggleSlot(slot.value)}
                    className="w-4 h-4 accent-teal-brand rounded"
                  />
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex flex-col flex-1 min-w-0">
                      {slot.label.includes(' - ') ? (
                        <span className="text-xs font-medium text-stone-700">{slot.label}</span>
                      ) : (
                        <>
                          <span className="text-xs font-semibold text-stone-800 truncate">{slot.label}</span>
                          <span className="text-[10px] text-stone-400">{slot.time} - {String(parseInt(slot.time) + 1).padStart(2, '0')}:00</span>
                        </>
                      )}
                    </div>
                    {slot.capacity && (
                      <span className="text-xs font-bold text-teal-brand bg-teal-brand/10 px-3 py-1 rounded-full shrink-0">
                        {slot.capacity}
                      </span>
                    )}
                  </div>
                  {si >= DEFAULT_SLOTS.length && (
                    <button
                      onClick={() => {
                        const next = allSlots.filter((_, i) => i !== si)
                        setCustomSlots(next)
                      }}
                      className="ml-auto text-red-400 hover:text-red-600 text-[10px] shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </label>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full mt-4 py-3.5 rounded-xl bg-teal-brand text-white font-bold text-sm shadow-lg hover:bg-teal-light active:scale-[0.98] transition-all"
            >
              Opublikuj grafik
            </button>

            {savedMessage && (
              <p className="text-center text-xs text-green-accent font-medium mt-2">Grafik zostal zapisany!</p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-white/50 rounded-2xl p-3 border border-sand/10">
          <p className="text-[10px] text-stone-400 text-center">
            Daty z zajetiami sa podswietlone na birazowo. Kliknij date, aby edytowac sloty. Mozesz dodawac dowolne godziny zajec.
          </p>
        </div>
      </div>
    </div>
  )
}
