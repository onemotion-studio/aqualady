import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MONTHS_PL, DAYS_PL, loadPoolsAsync, loadPools, saveCustomPool, removeCustomPool, DEFAULT_SLOTS, type PoolConfig } from '../config'
import { useSchedule, type TimeSlotDef } from '../context/ScheduleContext'
import { loadBookingsFromServer, loadPromocodesFromServer, savePromocodeToServer, deletePromocodeFromServer, loadTemplatesFromServer, saveTemplateToServer, deleteTemplateFromServer, loadSubscriptionsFromServer, saveSubscriptionToServer, deleteSubscriptionFromServer, type BookingRow, type PromocodeRow, type SubscriptionTemplate, type Subscription } from '../lib/supabase'

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
  temp: string
}

const emptyForm: PoolForm = { name: '', address: '', lat: '', lng: '', temp: '' }

export default function TrainerDashboard() {
  const navigate = useNavigate()
  const { schedule, saveSchedule, getScheduleForPool } = useSchedule()

      const [allPools, setAllPools] = useState<Record<string, PoolConfig>>({})
  const [poolsLoaded, setPoolsLoaded] = useState(false)
  const poolList = useMemo(() => Object.values(allPools), [allPools])
  const [activePoolId, setActivePoolId] = useState<string>('')

  // Асинхронная загрузка бассейнов
  useEffect(() => {
    loadPoolsAsync().then(pools => {
      setAllPools(pools)
      setPoolsLoaded(true)
      const keys = Object.keys(pools)
      if (keys.length > 0) {
        setActivePoolId(keys[0])
      }
    }).catch(() => setPoolsLoaded(true))
  }, [])
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
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null)
  const [editingSlotIdx, setEditingSlotIdx] = useState<number | null>(null)
  const [editSlotStart, setEditSlotStart] = useState('')
  const [editSlotEnd, setEditSlotEnd] = useState('')
  const [editSlotLabel, setEditSlotLabel] = useState('')
  const [editSlotCapacity, setEditSlotCapacity] = useState('')

    // Promocodes state
  const [tab, setTab] = useState<'schedule' | 'promocodes' | 'subscriptions'>('schedule')
  const [promocodes, setPromocodes] = useState<PromocodeRow[]>([])
  const [showPromoForm, setShowPromoForm] = useState(false)
  const [editPromoId, setEditPromoId] = useState<string | null>(null)
  const [promoCalendarMonth, setPromoCalendarMonth] = useState<Date | null>(null)
    const [promoForm, setPromoForm] = useState({
      code: '',
      discount_type: 'percent' as 'percent' | 'fixed',
      discount_value: '',
      max_uses: '',
      expires_at: '',
      is_active: true,
      pool_id: '',
      date: '',
      time_slots: [] as string[],
      min_quantity: '',
    })

    // Load promocodes
  useEffect(() => {
    loadPromocodesFromServer().then(data => setPromocodes(data)).catch(() => {})
  }, [])

  // Subscription templates state
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [showTemplateForm, setShowTemplateForm] = useState(false)
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null)
    const [templateForm, setTemplateForm] = useState({
    name: '',
    pool_id: '',
    total_classes: '8',
    price: '',
    tag: '',
    days_of_week: [] as number[],
    time_slots: [] as string[],
  })
  const [showSubForm, setShowSubForm] = useState(false)
  const [subForm, setSubForm] = useState({
    template_id: '',
    month: '',
    year: String(new Date().getFullYear()),
  })

  // Load templates & subscriptions
  useEffect(() => {
    loadTemplatesFromServer().then(data => setTemplates(data)).catch(() => {})
    loadSubscriptionsFromServer().then(data => setSubscriptions(data)).catch(() => {})
  }, [])

  const DAY_NAMES = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Niedz']

  // Load bookings from server
  useEffect(() => {
    loadBookingsFromServer().then(data => {
      setBookings(data)
    }).catch(() => {})
  }, [])

  // Persist custom slots
  useEffect(() => {
    saveCustomSlots(customSlots)
  }, [customSlots])

  const activePool = poolList.find(p => p.id === activePoolId)
  const poolSchedule = getScheduleForPool(activePoolId)
  const scheduledDates = useMemo(() => new Set(poolSchedule.map(s => s.date)), [poolSchedule])
    const allSlots = customSlots

  // Даты с бронированиями для подсветки
  const bookedDates = useMemo(() => {
    const dates = new Set<string>()
    bookings.forEach(b => {
      if (b.pool_id === activePoolId) {
        dates.add(b.date)
      }
    })
    return dates
  }, [bookings, activePoolId])

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
      temp: String(activePool.temp),
    })
    setShowPoolForm(true)
  }

  const closePoolForm = () => {
    setShowPoolForm(false)
    setEditingPoolId(null)
    setPoolForm(emptyForm)
  }

  const handleSavePool = async () => {
    const id = editingPoolId || 'custom_' + Date.now()
        const pool: PoolConfig = {
          id,
          name: poolForm.name,
          address: poolForm.address,
          temp: parseInt(poolForm.temp) || 28,
          distance: '-',
          lat: parseFloat(poolForm.lat) || 0,
          lng: parseFloat(poolForm.lng) || 0,
        }
        await saveCustomPool(pool)
    setAllPools(prev => ({ ...prev, [id]: pool }))
    setActivePoolId(id)
    closePoolForm()
  }

  const handleDeletePool = async (poolId: string) => {
    if (!poolId.startsWith('custom_')) return
        await removeCustomPool(poolId)
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

  const startEditSlot = (slot: TimeSlotDef, idx: number) => {
    setEditingSlotIdx(idx)
    const parts = slot.label.split(' - ')
    setEditSlotStart(parts[0] || slot.time)
    setEditSlotEnd(parts[1] || '')
    setEditSlotLabel(slot.label)
    setEditSlotCapacity(String(slot.capacity || ''))
  }

  const cancelEditSlot = () => {
    setEditingSlotIdx(null)
    setEditSlotStart('')
    setEditSlotEnd('')
    setEditSlotLabel('')
    setEditSlotCapacity('')
  }

  const saveEditSlot = (idx: number) => {
    if (!editSlotStart || !editSlotEnd) return
    const value = 'slot_' + editSlotStart.replace(':', '')
    const defaultLabel = editSlotStart + ' - ' + editSlotEnd
    const label = editSlotLabel || defaultLabel
    const capacity = parseInt(editSlotCapacity) || 0
    setCustomSlots(prev => {
      const next = [...prev]
      next[idx] = { time: editSlotStart, label, value, capacity }
      return next
    })
    cancelEditSlot()
  }

  // Promocodes handlers
    const resetPromoForm = () => {
      setPromoForm({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '', is_active: true, pool_id: '', date: '', time_slots: [], min_quantity: '' })
      setEditPromoId(null)
      setPromoCalendarMonth(null)
    }

  const openAddPromo = () => {
    resetPromoForm()
    setShowPromoForm(true)
  }

    const openEditPromo = (p: PromocodeRow) => {
      setEditPromoId(p.id)
      setPromoForm({
        code: p.code,
        discount_type: p.discount_type,
        discount_value: String(p.discount_value),
        max_uses: String(p.max_uses),
        expires_at: p.expires_at ? p.expires_at.slice(0, 10) : '',
        is_active: p.is_active,
        pool_id: p.pool_id || '',
        date: p.date || '',
        time_slots: p.time_slot ? p.time_slot.split(',') : [],
        min_quantity: String(p.min_quantity || 0),
      })
      setPromoCalendarMonth(p.date ? new Date(p.date) : null)
      setShowPromoForm(true)
    }

  const handleSavePromo = async () => {
    const id = editPromoId || 'promo_' + Date.now()
    const value = parseInt(promoForm.discount_value) || 0
    const maxUses = parseInt(promoForm.max_uses) || 0
    if (!promoForm.code || value <= 0) return
        const promocode = {
          id,
          code: promoForm.code.toUpperCase().trim(),
          discount_type: promoForm.discount_type,
          discount_value: value,
          max_uses: maxUses,
          used_count: promocodes.find(p => p.id === id)?.used_count || 0,
          expires_at: promoForm.expires_at ? promoForm.expires_at + 'T23:59:59' : null,
          is_active: promoForm.is_active,
          pool_id: promoForm.pool_id || null,
          date: promoForm.date || null,
          time_slot: promoForm.time_slots.length > 0 ? promoForm.time_slots.join(',') : null,
          min_quantity: promoForm.min_quantity ? parseInt(promoForm.min_quantity) : null,
        }
    const ok = await savePromocodeToServer(promocode)
    if (ok) {
      const reloaded = await loadPromocodesFromServer()
      setPromocodes(reloaded)
    }
    setShowPromoForm(false)
    resetPromoForm()
  }

  const handleDeletePromo = async (id: string) => {
    const ok = await deletePromocodeFromServer(id)
    if (ok) {
      setPromocodes(prev => prev.filter(p => p.id !== id))
    }
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-800">Panel Trenera</h1>
            <p className="text-xs sm:text-sm text-stone-400">Zarządzanie zajęciami</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="text-xs sm:text-sm text-stone-400 underline hover:text-stone-600"
          >
            Strona główna
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-white rounded-2xl p-1 border border-sand/20 shadow-sm">
          <button
            onClick={() => setTab('schedule')}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              tab === 'schedule' ? 'bg-gradient-primary text-white shadow-md' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            Grafik zajęć
          </button>
                    <button
            onClick={() => setTab('promocodes')}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === 'promocodes' ? 'bg-gradient-primary text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Promokody ({promocodes.length})
          </button>
          <button
            onClick={() => setTab('subscriptions')}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === 'subscriptions' ? 'bg-gradient-primary text-white shadow-md' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Subskrypcje ({subscriptions.length})
          </button>
        </div>

        {/* Schedule Tab */}
        {tab === 'schedule' && (
        <>
          {/* Pool selector with actions */}
          <div className="mb-5">
          <label className="text-xs sm:text-sm font-medium text-stone-500 mb-1.5 block">Wybierz basen:</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={activePoolId}
                onChange={e => { setActivePoolId(e.target.value); setSelectedDate(null); setCheckedSlots(new Set()) }}
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-sand/30 text-sm text-stone-700 focus:border-gradient-primary focus:outline-none appearance-none"
              >
                {poolList.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={openEditPool}
              className="px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-white border border-sand/30 text-stone-500 hover:border-gradient-primary/40 hover:text-gradient-primary transition-all"
              title="Edytuj basen"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={openAddPool}
              className="px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:brightness-110 active:scale-[0.98] transition-all"
              title="Dodaj nowy basen"
            >
              + Nowy
            </button>
            <button
              onClick={() => handleDeletePool(activePoolId)}
              disabled={!activePoolId.startsWith('custom_')}
              className="px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-red-50 border border-red-200 text-red-500 text-sm font-medium hover:bg-red-100 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Usun basen"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pool form (add / edit) */}
        {showPoolForm && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/20 mb-5 space-y-3">
            <p className="text-xs sm:text-sm font-semibold text-stone-700">{editingPoolId ? 'Edytuj basen' : 'Dodaj nowy basen'}</p>
            <input
              placeholder="Nazwa basenu"
              value={poolForm.name}
              onChange={e => setPoolForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
            />
            <input
              placeholder="Adres"
              value={poolForm.address}
              onChange={e => setPoolForm(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
            />
                        <input
                          placeholder="Temperatura (np. 28)"
                          value={poolForm.temp}
                          onChange={e => setPoolForm(prev => ({ ...prev, temp: e.target.value }))}
                          className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                          type="number"
                        />
            <div className="flex gap-2">
              <input
                placeholder="Szerokosc (lat)"
                value={poolForm.lat}
                onChange={e => setPoolForm(prev => ({ ...prev, lat: e.target.value }))}
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                type="number"
                step="any"
              />
              <input
                placeholder="Dlugosc (lng)"
                value={poolForm.lng}
                onChange={e => setPoolForm(prev => ({ ...prev, lng: e.target.value }))}
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                type="number"
                step="any"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSavePool}
                disabled={!poolForm.name}
                className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-primary text-white text-sm font-bold disabled:bg-stone-200 disabled:text-stone-400 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                {editingPoolId ? 'Zapisz zmiany' : 'Dodaj basen'}
              </button>
              <button
                onClick={closePoolForm}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm text-stone-500 hover:bg-stone-50 transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        )}

        {/* Calendar */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 lg:p-5 shadow-sm border border-sand/20 mb-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm sm:text-base lg:text-lg font-semibold text-stone-800">{MONTHS_PL[currentMonth]} {currentYear}</span>
            <button
              onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            {DAYS_PL.map(d => (
              <div key={d} className="text-center text-xs sm:text-sm lg:text-sm font-medium text-stone-400 py-0.5 sm:py-1">{d}</div>
            ))}
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {week.map((day, di) => {
                  if (day === null) return <div key={di} className="aspect-square" />
                                    const dateStr = formatDate(day)
                  const isPast = isPastDate(day)
                  const isThisSelected = selectedDate === dateStr
                  const hasSchedule = scheduledDates.has(dateStr)
                  const hasBookings = bookedDates.has(dateStr)
                  const isToday = dateStr === todayStr

                  return (
                    <button
                      key={di}
                      disabled={isPast}
                      onClick={() => handleDateClick(dateStr)}
                      className={`aspect-square rounded-lg text-xs sm:text-sm lg:text-base font-medium transition-all flex flex-col items-center justify-center relative ${
                        isPast ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer hover:bg-sand-light'
                      } ${
                        isThisSelected ? 'bg-gradient-primary text-white shadow-md' : ''
                      } ${
                        hasBookings && !isThisSelected ? 'bg-amber-700/15 text-amber-700 font-bold' : ''
                      } ${
                        hasSchedule && !isThisSelected && !hasBookings ? 'bg-gradient-primary/15 text-gradient-primary font-bold' : ''
                      } ${
                        isToday && !isThisSelected && !hasSchedule && !hasBookings ? 'border border-gradient-primary/40 text-gradient-primary font-bold' : ''
                      } ${
                        !isThisSelected && !isPast && !hasSchedule && !hasBookings && !isToday ? 'text-stone-700' : ''
                      }`}
                    >
                      <span>{day}</span>
                      </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Slot checkboxes */}
        {selectedDate && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/20 mb-4">
            <p className="text-xs sm:text-sm font-medium text-stone-500 mb-3">
              Zajecia na dzien <span className="font-semibold text-stone-700">{selectedDate.slice(8, 10)}.{selectedDate.slice(5, 7)}.{selectedDate.slice(0, 4)}</span>
            </p>

            {/* Custom slot input */}
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="time"
                value={newSlotStart}
                onChange={e => setNewSlotStart(e.target.value)}
                className="flex-1 px-3 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-xs sm:text-sm focus:border-gradient-primary focus:outline-none"
                placeholder="Poczatek"
              />
              <input
                type="time"
                value={newSlotEnd}
                onChange={e => setNewSlotEnd(e.target.value)}
                className="flex-1 px-3 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-xs sm:text-sm focus:border-gradient-primary focus:outline-none"
                placeholder="Koniec"
              />
                        </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                value={newSlotLabel}
                onChange={e => setNewSlotLabel(e.target.value)}
                className="flex-1 px-3 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-xs sm:text-sm focus:border-gradient-primary focus:outline-none"
                placeholder="Opis (opcjonalnie)"
              />
              <input
                type="number"
                min="1"
                max="99"
                value={newSlotCapacity}
                onChange={e => setNewSlotCapacity(e.target.value)}
                className="w-full sm:w-24 px-3 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-xs sm:text-sm focus:border-gradient-primary focus:outline-none"
                placeholder="Miejsca"
              />
            </div>
            <button
              onClick={addCustomSlot}
              disabled={!newSlotStart || !newSlotEnd}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-primary text-white text-xs sm:text-sm font-bold disabled:bg-stone-200 disabled:text-stone-400 hover:brightness-110 transition-all mb-4"
            >
              + Dodaj
            </button>

                        <div className="space-y-2">
              {allSlots.map((slot, si) => {
                const isChecked = checkedSlots.has(slot.value)
                const slotBookings = selectedDate ? bookings.filter(b => b.pool_id === activePoolId && b.date === selectedDate && b.time === slot.value) : []
                const totalBooked = slotBookings.reduce((s, r) => s + r.quantity, 0)
                const isExpanded = expandedSlot === slot.value

                // Режим редактирования слота
                if (editingSlotIdx === si) {
                  return (
                    <div key={slot.value} className="bg-amber-50 rounded-xl p-3 sm:p-4 border border-amber-200 space-y-2">
                      <p className="text-xs font-semibold text-amber-800">Edytuj slot</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="time" value={editSlotStart} onChange={e => setEditSlotStart(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-amber-200 text-xs focus:border-gradient-primary focus:outline-none" />
                        <input type="time" value={editSlotEnd} onChange={e => setEditSlotEnd(e.target.value)} className="flex-1 px-3 py-2 rounded-lg border border-amber-200 text-xs focus:border-gradient-primary focus:outline-none" />
                      </div>
                      <input value={editSlotLabel} onChange={e => setEditSlotLabel(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs focus:border-gradient-primary focus:outline-none" placeholder="Opis" />
                      <input type="number" min="1" max="99" value={editSlotCapacity} onChange={e => setEditSlotCapacity(e.target.value)} className="w-full sm:w-24 px-3 py-2 rounded-lg border border-amber-200 text-xs focus:border-gradient-primary focus:outline-none" placeholder="Miejsca" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEditSlot(si)} disabled={!editSlotStart || !editSlotEnd} className="flex-1 py-2 rounded-lg bg-gradient-primary text-white text-xs font-bold disabled:bg-stone-300 hover:brightness-110 transition-all">Zapisz</button>
                        <button onClick={cancelEditSlot} className="px-4 py-2 rounded-lg border border-stone-300 text-xs text-stone-500 hover:bg-stone-50 transition-all">Anuluj</button>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={slot.value}>
                                        <label className={`flex items-center gap-3 px-4 py-3 sm:py-3.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                      isChecked ? 'bg-gradient-primary border-gradient-primary text-white' : 'bg-white border-sand/30 text-stone-600 hover:border-gradient-primary/40'
                    }`}>
                                            <input type="checkbox" checked={isChecked} onChange={() => toggleSlot(slot.value)} className="w-4 h-4 sm:w-5 sm:h-5 accent-gradient-primary rounded" />
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex flex-col flex-1 min-w-0">
                          {slot.label.includes(' - ') ? (
                            <span className={`text-xs sm:text-sm font-medium ${isChecked ? 'text-white' : 'text-stone-700'}`}>{slot.label}</span>
                          ) : (
                            <>
                              <span className={`text-xs sm:text-sm font-semibold truncate ${isChecked ? 'text-white' : 'text-stone-800'}`}>{slot.label}</span>
                              <span className={`text-xs sm:text-sm ${isChecked ? 'text-white/70' : 'text-stone-400'}`}>{slot.time} - {String(parseInt(slot.time) + 1).padStart(2, '0')}:00</span>
                            </>
                          )}
                        </div>
                        {slot.capacity ? (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 ${isChecked ? 'bg-white text-gradient-primary' : 'text-gradient-primary bg-gradient-primary/10'}`}>{slot.capacity}</span>
                        ) : null}
                        {/* Индикатор бронирований */}
                        {totalBooked > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title={`${totalBooked} os. zapisanych`} />
                        )}
                      </div>
                                            <div className="flex items-center gap-1 shrink-0">
                        {totalBooked > 0 && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isChecked ? 'text-gradient-primary bg-white' : 'text-amber-600 bg-amber-50'}`}>{totalBooked}</span>
                        )}
                        <button type="button" onClick={(e) => { e.preventDefault(); startEditSlot(slot, si) }} className={`transition-colors ${isChecked ? 'text-white/80 hover:text-white' : 'text-stone-400 hover:text-gradient-primary'}`} title="Edytuj">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); const next = allSlots.filter((_, i) => i !== si); setCustomSlots(next) }} className={`transition-colors ${isChecked ? 'text-white/80 hover:text-white' : 'text-red-400 hover:text-red-600'}`} title="Usun">
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        {slotBookings.length > 0 && (
                          <button type="button" onClick={(e) => { e.preventDefault(); setExpandedSlot(isExpanded ? null : slot.value) }} className={`transition-colors ${isChecked ? 'text-white/80 hover:text-white' : 'text-stone-400 hover:text-stone-600'}`}>
                            <svg className={'w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ' + (isExpanded ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        )}
                      </div>
                    </label>
                    {/* Раскрывающийся список клиентов */}
                    {isExpanded && slotBookings.length > 0 && (
                      <div className="bg-stone-50 rounded-xl mx-2 mb-2 p-3 space-y-1.5 border border-stone-200">
                        <p className="text-xs font-medium text-stone-500 mb-1">Zapisani ({totalBooked} os.):</p>
                        {slotBookings.map((r, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                            <span className="w-5 h-5 rounded-full bg-gradient-primary/10 text-gradient-primary font-bold flex items-center justify-center shrink-0 text-[10px]">{r.quantity}</span>
                            <span className="font-medium text-stone-700">{r.name || '—'}</span>
                            {r.email && <span className="text-stone-400 text-xs truncate">{r.email}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

                        <button
              onClick={handleSave}
              className="w-full mt-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-primary text-white font-bold text-sm sm:text-base shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Opublikuj grafik
            </button>

                        {savedMessage && (
              <p className="text-center text-xs sm:text-sm text-green-accent font-medium mt-2">Grafik zostal zapisany!</p>
            )}
          </div>
        )}

                {/* Info */}
        <div className="bg-white/50 rounded-2xl p-3 sm:p-4 border border-sand/10">
          <p className="text-xs sm:text-sm text-stone-400 text-center">
            Daty z zajęciami są podświetlone na birazowo. Kliknij datę, aby edytować sloty. Możesz dodawać dowolne godziny zajęć.
          </p>
                </div>
      </>)}

      {/* Promocodes Tab */}
      {tab === 'promocodes' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-stone-600">Lista promokodów</p>
            <button
              onClick={openAddPromo}
              className="px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-bold hover:brightness-110 active:scale-[0.98] transition-all"
            >
              + Nowy kod
            </button>
          </div>

                    {/* Form */}
          {showPromoForm && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/20 space-y-3">
              <p className="text-xs sm:text-sm font-semibold text-stone-700">
                {editPromoId ? 'Edytuj promokod' : 'Nowy promokod'}
              </p>
              <input
                placeholder="Kod (np. ZNIŻKA10)"
                value={promoForm.code}
                onChange={e => setPromoForm(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none uppercase"
              />
              <div className="flex gap-2">
                <select
                  value={promoForm.discount_type}
                  onChange={e => setPromoForm(prev => ({ ...prev, discount_type: e.target.value as 'percent' | 'fixed' }))}
                  className="px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                >
                  <option value="percent">%</option>
                  <option value="fixed">zł</option>
                </select>
                <input
                  type="number"
                  min="1"
                  placeholder={promoForm.discount_type === 'percent' ? 'Rabat %' : 'Kwota zł'}
                  value={promoForm.discount_value}
                  onChange={e => setPromoForm(prev => ({ ...prev, discount_value: e.target.value }))}
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  placeholder="Max użyć (0 = bez limitu)"
                  value={promoForm.max_uses}
                  onChange={e => setPromoForm(prev => ({ ...prev, max_uses: e.target.value }))}
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                />
                <input
                  type="date"
                  value={promoForm.expires_at}
                  onChange={e => setPromoForm(prev => ({ ...prev, expires_at: e.target.value }))}
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={promoForm.is_active}
                  onChange={e => setPromoForm(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-gradient-primary rounded"
                />
                Aktywny
              </label>

              {/* Ograniczenia — wybor basenu, daty i slotow */}
              <div className="border-t border-sand/20 pt-3 space-y-3">
                <p className="text-xs font-medium text-stone-500 mb-2">Ograniczenia (opcjonalne)</p>

                {/* Wybor basenu */}
                <select
                  value={promoForm.pool_id}
                  onChange={e => {
                    setPromoForm(prev => ({ ...prev, pool_id: e.target.value, date: '', time_slots: [] }))
                    setPromoCalendarMonth(null)
                  }}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                >
                  <option value="">Dowolny basen</option>
                  {poolList.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                {/* Kalendarz — tylko gdy wybrany basen */}
                {promoForm.pool_id && (
                  <>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => setPromoCalendarMonth(prev => {
                            const d = prev ? new Date(prev) : new Date()
                            d.setMonth(d.getMonth() - 1)
                            return d
                          })}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <span className="text-xs sm:text-sm font-semibold text-stone-700">
                          {MONTHS_PL[(promoCalendarMonth || new Date()).getMonth()]} {(promoCalendarMonth || new Date()).getFullYear()}
                        </span>
                        <button
                          onClick={() => setPromoCalendarMonth(prev => {
                            const d = prev ? new Date(prev) : new Date()
                            d.setMonth(d.getMonth() + 1)
                            return d
                          })}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors text-stone-600"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                        {DAYS_PL.map(d => (
                          <div key={d} className="text-center text-[10px] font-medium text-stone-400 py-0.5">{d}</div>
                        ))}
                      </div>

                      {(() => {
                        const calDate = promoCalendarMonth || new Date()
                        const year = calDate.getFullYear()
                        const month = calDate.getMonth()
                        const daysInM = new Date(year, month + 1, 0).getDate()
                        const firstDow = new Date(year, month, 1).getDay()
                        const offset = firstDow === 0 ? 6 : firstDow - 1
                        const todayStr = new Date().toISOString().slice(0, 10)
                        const promoPoolSchedule = getScheduleForPool(promoForm.pool_id)
                        const datesWithSlots = new Set(promoPoolSchedule.map(s => s.date))

                        const calWeeks: (number | null)[][] = []
                        let calWeek: (number | null)[] = []
                        for (let i = 0; i < offset; i++) calWeek.push(null)
                        for (let day = 1; day <= daysInM; day++) {
                          calWeek.push(day)
                          if (calWeek.length === 7) { calWeeks.push(calWeek); calWeek = [] }
                        }
                        if (calWeek.length > 0) { while (calWeek.length < 7) calWeek.push(null); calWeeks.push(calWeek) }

                        return calWeeks.map((week, wi) => (
                          <div key={wi} className="grid grid-cols-7 gap-0.5">
                            {week.map((day, di) => {
                              if (day === null) return <div key={di} className="aspect-square" />
                              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                              const isPast = dateStr < todayStr
                              const isSelected = promoForm.date === dateStr
                              const hasSlots = datesWithSlots.has(dateStr)
                              return (
                                <button
                                  key={di}
                                  disabled={isPast}
                                  onClick={() => {
                                    setPromoForm(prev => ({ ...prev, date: prev.date === dateStr ? '' : dateStr, time_slots: prev.date === dateStr ? [] : prev.time_slots }))
                                  }}
                                  className={`aspect-square rounded-md text-[10px] font-medium transition-all ${
                                    isPast ? 'text-stone-300 cursor-not-allowed' : 'cursor-pointer'
                                  } ${
                                    isSelected ? 'bg-gradient-primary text-white shadow-sm' : ''
                                  } ${
                                    hasSlots && !isSelected ? 'bg-gradient-primary/10 text-gradient-primary font-bold' : ''
                                  } ${
                                    !isSelected && !hasSlots && !isPast ? 'text-stone-600 hover:bg-sand-light' : ''
                                  }`}
                                >
                                  {day}
                                </button>
                              )
                            })}
                          </div>
                        ))
                      })()}
                    </div>

                    {/* Lista slotow dla wybranej daty */}
                    {promoForm.date && (() => {
                      const entry = poolSchedule.find(s => s.poolId === promoForm.pool_id && s.date === promoForm.date)
                      const slots = entry?.slots || []
                      if (slots.length === 0) return <p className="text-xs text-stone-400 text-center py-2">Brak slotów w tym dniu</p>
                      return (
                        <div className="space-y-1.5">
                          <p className="text-xs font-medium text-stone-500">
                            {slots.length === 1 ? 'Wybierz slot (opcjonalnie)' : 'Wybierz sloty (opcjonalnie)'}
                          </p>
                          {slots.map(slot => {
                            const isChecked = promoForm.time_slots.includes(slot.value)
                            return (
                                                            <label key={slot.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all ${
                                isChecked ? 'bg-gradient-primary border-gradient-primary text-white' : 'bg-white border-sand/30 text-stone-600 hover:border-gradient-primary/40'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    setPromoForm(prev => ({
                                      ...prev,
                                      time_slots: isChecked
                                        ? prev.time_slots.filter(v => v !== slot.value)
                                        : [...prev.time_slots, slot.value],
                                    }))
                                  }}
                                  className="w-3.5 h-3.5 accent-gradient-primary rounded"
                                />
                                <span className={`font-medium ${isChecked ? 'text-white' : ''}`}>{slot.label}</span>
                                {slot.capacity ? <span className={`ml-auto ${isChecked ? 'text-white/70' : 'text-stone-400'}`}>max {slot.capacity} os.</span> : null}
                              </label>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </>
                )}

                                {/* Min. liczba zajec */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-500">Min. liczba zajęć</label>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Promokod zadziała tylko wtedy, gdy w koszyku znajduje się co najmniej podana liczba zajęć. 
                    Jeśli pole pozostawisz puste lub wpiszesz 0 — wymaganie nie będzie sprawdzane.
                  </p>
                  <input
                    type="number"
                    min="0"
                    placeholder="np. 3"
                    value={promoForm.min_quantity}
                    onChange={e => setPromoForm(prev => ({ ...prev, min_quantity: e.target.value }))}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-gradient-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSavePromo}
                  disabled={!promoForm.code || !promoForm.discount_value}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-primary text-white text-sm font-bold disabled:bg-stone-200 disabled:text-stone-400 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {editPromoId ? 'Zapisz zmiany' : 'Dodaj kod'}
                </button>
                <button
                  onClick={() => { setShowPromoForm(false); resetPromoForm() }}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm text-stone-500 hover:bg-stone-50 transition-all"
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {promocodes.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-sand/20">
              <p className="text-sm text-stone-400">Brak promokodów. Dodaj pierwszy!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {promocodes.map(p => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date()
                const isMaxed = p.max_uses > 0 && p.used_count >= p.max_uses
                const isActive = p.is_active && !isExpired && !isMaxed
                return (
                  <div key={p.id} className="bg-white rounded-2xl p-4 border border-sand/20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                        <div>
                          <span className="text-sm sm:text-base font-bold text-stone-800">{p.code}</span>
                          <span className="text-xs text-stone-400 ml-2">
                            {p.discount_type === 'percent' ? `${p.discount_value}%` : `${p.discount_value} zł`}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">
                          {p.max_uses > 0 ? `${p.used_count}/${p.max_uses}` : `${p.used_count} użyć`}
                        </span>
                        <button
                          onClick={() => openEditPromo(p)}
                          className="text-stone-400 hover:text-gradient-primary transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeletePromo(p.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                                        {p.expires_at && (
                      <p className="text-xs text-stone-400 mt-1 ml-5">
                        {isExpired ? 'Wygasł: ' : 'Ważny do: '}{new Date(p.expires_at).toLocaleDateString('pl-PL')}
                      </p>
                    )}
                    {p.pool_id && (
                      <p className="text-xs text-stone-400 mt-1 ml-5">Basen: {allPools[p.pool_id]?.name || p.pool_id}</p>
                    )}
                    {p.date && (
                      <p className="text-xs text-stone-400 mt-1 ml-5">Data: {p.date.slice(8, 10)}.{p.date.slice(5, 7)}.{p.date.slice(0, 4)}</p>
                    )}
                                        {p.time_slot && (
                      <p className="text-xs text-stone-400 mt-1 ml-5">Godziny: {p.time_slot.split(',').map(t => t.replace('slot_', '').replace(/(\d{2})(\d{2})/, '$1:$2')).join(', ')}</p>
                    )}
                                        {typeof p.min_quantity === 'number' && p.min_quantity > 0 && (
                      <p className="text-xs text-stone-400 mt-1 ml-5">Min. liczba zajęć: {p.min_quantity}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Subscriptions Tab */}
      {tab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-stone-700">Szablony abonamentów</p>
              <button onClick={() => { setEditTemplateId(null); setTemplateForm({ name: '', pool_id: '', total_classes: '8', price: '', tag: '', days_of_week: [], time_slots: [] }); setShowTemplateForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="px-3 py-1.5 rounded-xl bg-gradient-primary text-white text-xs font-bold hover:brightness-110 transition-all">+ Nowy szablon</button>
            </div>
            {showTemplateForm && (
              <div className="bg-stone-50 rounded-xl p-3 sm:p-4 space-y-2.5 mb-3">
                <input placeholder="Nazwa (np. 8 zajęć — poranki)" value={templateForm.name} onChange={e => setTemplateForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none" />
      <input placeholder="Etykieta (np. podstawowy, popularny, bezlimit)" value={templateForm.tag} onChange={e => setTemplateForm(p => ({ ...p, tag: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none" />
                <div className="flex gap-2">
                  <select value={templateForm.pool_id} onChange={e => setTemplateForm(p => ({ ...p, pool_id: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none">
                    <option value="">Wybierz basen</option>
                    {poolList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input type="number" min="1" placeholder="Liczba" value={templateForm.total_classes} onChange={e => setTemplateForm(p => ({ ...p, total_classes: e.target.value }))} className="w-20 px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none" />
                  <div className="relative">
                    <input type="number" min="1" placeholder="Cena" value={templateForm.price} onChange={e => setTemplateForm(p => ({ ...p, price: e.target.value }))} className="w-24 px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none pr-5" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-stone-400">zł</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-stone-500 mb-1">Dni tygodnia:</p>
                  <div className="flex flex-wrap gap-1">
                    {DAY_NAMES.map((n, idx) => {
                      const on = templateForm.days_of_week.includes(idx)
                      return <button key={idx} onClick={() => setTemplateForm(p => ({ ...p, days_of_week: on ? p.days_of_week.filter(d => d !== idx) : [...p.days_of_week, idx].sort() }))} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${on ? 'bg-gradient-primary text-white' : 'bg-white border border-sand/30 text-stone-600 hover:border-gradient-primary/40'}`}>{n}</button>
                    })}
                  </div>
                </div>
                {templateForm.pool_id && (() => {
                  const slotSet = new Set<string>()
                  schedule.filter(s => s.poolId === templateForm.pool_id).forEach(s => s.slots.forEach(sl => slotSet.add(sl.value)))
                  const allSlots = Array.from(slotSet)
                  if (allSlots.length === 0) return null
                  return <div>
                    <p className="text-[10px] font-medium text-stone-500 mb-1">Godziny:</p>
                    <div className="flex flex-wrap gap-1">
                      {allSlots.map(slotVal => {
                        const def = customSlots.find(d => d.value === slotVal)
                        const label = def?.label || slotVal.replace('slot_', '').replace(/(\d{2})(\d{2})/, '$1:$2')
                        const on = templateForm.time_slots.includes(slotVal)
                        return <button key={slotVal} onClick={() => setTemplateForm(p => ({ ...p, time_slots: on ? p.time_slots.filter(s => s !== slotVal) : [...p.time_slots, slotVal] }))} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${on ? 'bg-gradient-primary text-white' : 'bg-white border border-sand/30 text-stone-600 hover:border-gradient-primary/40'}`}>{label}</button>
                      })}
                    </div>
                  </div>
                })()}
                <div className="flex gap-2 pt-1">
                  <button onClick={async () => { if (!templateForm.name || !templateForm.pool_id || !templateForm.price) return; const id = editTemplateId || 'tmpl_' + Date.now(); const ok = await saveTemplateToServer({ id, name: templateForm.name, pool_id: templateForm.pool_id, total_classes: parseInt(templateForm.total_classes) || 8, price: parseInt(templateForm.price) || 0, tag: templateForm.tag, days_of_week: templateForm.days_of_week, time_slots: templateForm.time_slots, is_active: true }); if (ok) setTemplates(await loadTemplatesFromServer()); setShowTemplateForm(false) }} disabled={!templateForm.name || !templateForm.pool_id || !templateForm.price} className="flex-1 py-2 rounded-lg bg-gradient-primary text-white text-xs font-bold disabled:bg-stone-300 hover:brightness-110 transition-all">{editTemplateId ? 'Zapisz' : 'Dodaj szablon'}</button>
                  <button onClick={() => setShowTemplateForm(false)} className="px-4 py-2 rounded-lg border border-stone-300 text-xs text-stone-500 hover:bg-stone-50 transition-all">Anuluj</button>
                </div>
              </div>
            )}
            {templates.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">Brak szablonów</p>
            ) : (
              <div className="space-y-1">
                {templates.map(t => (
                                    <div key={t.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-stone-700">{t.name}</span>
                      <span className="text-[10px] text-stone-400">{t.total_classes} · {t.price} zł · {poolList.find(p => p.id === t.pool_id)?.name || t.pool_id}</span>
                      {t.tag && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-primary/10 text-gradient-primary font-medium">{t.tag}</span>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => { setEditTemplateId(t.id); setTemplateForm({ name: t.name, pool_id: t.pool_id, total_classes: String(t.total_classes), price: String(t.price), tag: t.tag || '', days_of_week: t.days_of_week, time_slots: t.time_slots }); setShowTemplateForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="text-stone-400 hover:text-gradient-primary transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                      <button onClick={async () => { await deleteTemplateFromServer(t.id); setTemplates(prev => prev.filter(x => x.id !== t.id)) }} className="text-red-400 hover:text-red-600 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      <button onClick={() => { setSubForm({ template_id: t.id, month: String(new Date().getMonth() + 2 > 12 ? new Date().getMonth() + 2 - 12 : new Date().getMonth() + 2), year: String(new Date().getFullYear() + (new Date().getMonth() + 2 > 12 ? 1 : 0)) }); setShowSubForm(true) }} className="px-2 py-1 rounded-lg bg-gradient-primary/10 text-gradient-primary text-[10px] font-bold hover:bg-gradient-primary/20 transition-all">Utwórz</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/20">
            <p className="text-sm font-semibold text-stone-700 mb-3">Abonamenty miesięczne</p>
            {showSubForm && (
              <div className="bg-stone-50 rounded-xl p-3 sm:p-4 space-y-2.5 mb-3">
                <p className="text-xs font-semibold text-stone-600">Nowy abonament z szablonu</p>
                <div className="flex gap-2">
                  <select value={subForm.template_id} onChange={e => setSubForm(p => ({ ...p, template_id: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none">
                    <option value="">Szablon</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <select value={subForm.month} onChange={e => setSubForm(p => ({ ...p, month: e.target.value }))} className="flex-1 px-3 py-2 rounded-lg border border-sand/30 text-xs focus:border-gradient-primary focus:outline-none">
                    <option value="">Miesiąc</option>
                    {Array.from({ length: 6 }, (_, i) => { const n = new Date(); const m = n.getMonth() + 1 + i; const mo = m > 12 ? m - 12 : m; const yr = m > 12 ? n.getFullYear() + 1 : n.getFullYear(); return <option key={m} value={mo.toString()}>{MONTHS_PL[mo - 1]} {yr}</option> })}
                  </select>
                  <button onClick={async () => { const tmpl = templates.find(t => t.id === subForm.template_id); if (!tmpl || !subForm.month) return; const month = parseInt(subForm.month); const year = parseInt(subForm.year); const dates = []; const daysInM = new Date(year, month, 0).getDate(); for (let d = 1; d <= daysInM; d++) { const dt = new Date(year, month - 1, d); if (tmpl.days_of_week.includes((dt.getDay() + 6) % 7)) dates.push(year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0')) }; let expiresAt = null; if (dates.length > 0) { const fd = new Date(dates[0] + 'T00:00:00'); fd.setDate(fd.getDate() - 1); fd.setHours(23, 59, 59); expiresAt = fd.toISOString() }; const ok = await saveSubscriptionToServer({ id: 'sub_' + Date.now(), template_id: tmpl.id, pool_id: tmpl.pool_id, month, year, price: tmpl.price, total_classes: tmpl.total_classes, dates, time_slot: tmpl.time_slots[0] || '', is_published: true, expires_at: expiresAt }); if (ok) setSubscriptions(await loadSubscriptionsFromServer()); setShowSubForm(false) }} disabled={!subForm.template_id || !subForm.month} className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-xs font-bold disabled:bg-stone-300 hover:brightness-110 transition-all">Utwórz</button>
                  <button onClick={() => setShowSubForm(false)} className="px-4 py-2 rounded-lg border border-stone-300 text-xs text-stone-500 hover:bg-stone-50 transition-all">Anuluj</button>
                </div>
              </div>
            )}
            {subscriptions.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-4">Brak abonamentów</p>
            ) : (
              <div className="space-y-1">
                {subscriptions.map(s => {
                  const tmpl = templates.find(t => t.id === s.template_id)
                  const isExpired = s.expires_at && new Date(s.expires_at) < new Date()
                  return (
                    <div key={s.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${s.is_published && !isExpired ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className="text-xs font-bold text-stone-700">{tmpl?.name || '—'}</span>
                        <span className="text-[10px] text-stone-400">{MONTHS_PL[s.month - 1]} {s.year}</span>
                        <span className="text-[10px] text-stone-400">{s.total_classes} · {s.price} zł</span>
                        {isExpired && <span className="text-[10px] text-red-500 font-medium">wygasł</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={async () => { await saveSubscriptionToServer({ ...s, is_published: !s.is_published }); setSubscriptions(await loadSubscriptionsFromServer()) }} className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${s.is_published ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}`}>{s.is_published ? 'Aktywny' : 'Ukryty'}</button>
                        <button onClick={async () => { await deleteSubscriptionFromServer(s.id); setSubscriptions(prev => prev.filter(x => x.id !== s.id)) }} className="text-red-400 hover:text-red-600 transition-colors"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
