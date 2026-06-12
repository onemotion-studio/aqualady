import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import { useCart } from '../context/CartContext'
import { useSchedule } from '../context/ScheduleContext'
import { loadPoolsAsync, loadPools, PRICES, type PoolId, type PoolConfig } from '../config'
import { loadBookingsFromServer } from '../lib/supabase'

export default function BookingPage() {
  const navigate = useNavigate()
  const { dispatch, state: cartState } = useCart()
  const { schedule } = useSchedule()

  const [allPools, setAllPools] = useState<Record<string, PoolConfig>>(loadPools())
  const [poolsLoaded, setPoolsLoaded] = useState(false)
  const [selectedPool, setSelectedPool] = useState<PoolId | null>(null)
  const [expandedMap, setExpandedMap] = useState<PoolId | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [serverBookings, setServerBookings] = useState<Record<string, number>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmItem, setConfirmItem] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const slotsRef = useRef<HTMLDivElement>(null)

    const poolList = useMemo(() => Object.values(allPools), [allPools])

  // Асинхронная загрузка бассейнов с сервера
  useEffect(() => {
    loadPoolsAsync().then(pools => {
      setAllPools(pools)
      setPoolsLoaded(true)
    }).catch(() => setPoolsLoaded(true))
  }, [])

  // Загрузка броней с сервера
  const loadBookings = useCallback(() => {
    loadBookingsFromServer().then(data => {
      const map: Record<string, number> = {}
      data.forEach(b => {
        const key = b.pool_id + '|' + b.date + '|' + b.time
        map[key] = (map[key] || 0) + b.quantity
      })
      setServerBookings(map)
    }).catch(() => {})
  }, [])

  useEffect(() => { loadBookings() }, [loadBookings])

  // Re-sync on window focus (e.g. after returning from cart)
  useEffect(() => {
    window.addEventListener('focus', loadBookings)
    return () => window.removeEventListener('focus', loadBookings)
  }, [loadBookings])

  const handlePoolClick = (poolId: PoolId) => {
    if (selectedPool === poolId) {
      setExpandedMap(null)
            setSelectedPool(null)
      setSelectedDate(null)
        } else {
      setSelectedPool(poolId)
      setExpandedMap(poolId)
      setSelectedDate(null)
      setResetKey(k => k + 1)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
  }

  useEffect(() => {
    if (selectedDate && slotsRef.current) {
      setTimeout(() => {
        slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [selectedDate])

  const showAnimation = (label: string) => {
    setConfirmItem(label)
    setShowConfirm(true)
    setTimeout(() => {
      setShowConfirm(false)
      setConfirmItem('')
    }, 1800)
  }

  // Slots for selected date from schedule
  const slotsForSelectedDate = useMemo(() => {
    if (!selectedPool || !selectedDate) return []
    const entry = schedule.find(s => s.poolId === selectedPool && s.date === selectedDate)
    return entry ? entry.slots : []
  }, [selectedPool, selectedDate, schedule])

    // Scheduled date strings for the calendar highlight
  const scheduledDateStrings = useMemo(() => {
    if (!selectedPool) return []
    return schedule
      .filter(e => e.poolId === selectedPool && e.slots.length > 0)
      .map(e => e.date)
  }, [selectedPool, schedule])

    // Даты, в которых есть забронированные слоты (только подтверждённые с сервера)
  const bookedDateStrings = useMemo(() => {
    if (!selectedPool) return []
    const bookedDates = new Set<string>()
    Object.keys(serverBookings).forEach(key => {
      const [poolId, date] = key.split('|')
      if (poolId === selectedPool && date) {
        bookedDates.add(date)
      }
    })
    return Array.from(bookedDates)
  }, [selectedPool, serverBookings])

    const currentPool = selectedPool ? Object.values(allPools).find(p => p.id === selectedPool) : null

  // Count bookings from cart (current session)
  const bookedCount = useMemo(() => {
    const map = new Map<string, number>()
    cartState.items.forEach(item => {
      if (item.type === 'single' && item.poolId && item.date && item.time) {
        const key = item.poolId + '|' + item.date + '|' + item.time
        map.set(key, (map.get(key) || 0) + item.quantity)
      }
    })
    return map
  }, [cartState.items])

    // Enhanced slots with capacity info (persisted bookings only)
  const enrichedSlots = useMemo(() => {
    if (!selectedPool || !selectedDate) return []
    const entry = schedule.find(s => s.poolId === selectedPool && s.date === selectedDate)
    if (!entry) return []
    return entry.slots.map(slot => {
      const key = selectedPool + '|' + selectedDate + '|' + slot.value
      const serverBooked = serverBookings[key] || 0
      const cartBooked = bookedCount.get(key) || 0
      const totalBooked = serverBooked + cartBooked
      const capacity = slot.capacity || 0
      const remaining = capacity > 0 ? capacity - totalBooked : -1
      const isFull = capacity > 0 && remaining <= 0
      const isBookedByMe = serverBooked > 0
      return { ...slot, remaining, isFull, booked: totalBooked, isBookedByMe }
    })
  }, [selectedPool, selectedDate, schedule, bookedCount])

  // Check if ALL slots for selected date are full
  const allSlotsFull = useMemo(() => {
    return enrichedSlots.length > 0 && enrichedSlots.every(s => (s as any).isFull)
  }, [enrichedSlots])


    // Build availableDates for Calendar
  const availableDates = useMemo(() => {
    if (!selectedPool) return []
    const entries = schedule.filter(e => e.poolId === selectedPool && e.slots.length > 0)
    return entries.map(e => {
      const slots = e.slots.map(s => ({ label: s.label, time: s.time, value: s.value }))
      // Check if all slots on this date are fully booked
      const allFull = slots.every(s => {
        const key = selectedPool + '|' + e.date + '|' + s.value
        const serverBooked = serverBookings[key] || 0
        const cartKey = selectedPool + '|' + e.date + '|' + s.value
        const cartBooked = bookedCount.get(cartKey) || 0
        const totalBooked = serverBooked + cartBooked
        const origSlot = e.slots.find(es => es.value === s.value)
        const cap = origSlot?.capacity || 0
        return cap > 0 && totalBooked >= cap
      })
      return { date: e.date, slots, allSlotsFull: allFull }
    })
  }, [selectedPool, schedule, bookedCount])

    return (
    <div className="space-y-5 sm:space-y-6 pb-8 sm:pb-10 pt-4 max-w-3xl mx-auto">
      <h1 className="pt-4 text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">Wybierz zajecia</h1>

      {/* Pool Selection with accordion map */}
      <div className="space-y-3 sm:space-y-4">
        <p className="text-sm sm:text-base font-medium text-stone-600">Wybierz basen:</p>
        {poolList.map(p => {
          const isSelected = selectedPool === p.id
          const isExpanded = expandedMap === p.id

          return (
            <div key={p.id}>
              <button
                onClick={() => handlePoolClick(p.id)}
                className={'w-full bg-white rounded-2xl p-4 sm:p-5 shadow-sm border text-left transition-all active:scale-[0.99] ' + (isSelected ? 'border-teal-brand shadow-md' : 'border-sand/15 hover:shadow-md hover:border-teal-brand/30')}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm sm:text-base lg:text-lg font-bold text-stone-800">{p.name}</h3>
                                    <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C10.34 2 9 3.34 9 5v6.26A4.99 4.99 0 007 16c0 2.76 2.24 5 5 5s5-2.24 5-5c0-1.7-.85-3.22-2.15-4.14L15 12V5c0-1.66-1.34-3-3-3zm0 2c.55 0 1 .45 1 1v1h-2V5c0-.55.45-1 1-1z"/>
                    </svg>
                    <span className="text-[11px] sm:text-xs font-semibold text-stone-600">{p.temp}°C</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] sm:text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {p.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      {p.distance}
                    </span>
                  </div>
                  <svg className={'w-4 h-4 sm:w-5 sm:h-5 text-stone-400 transition-transform duration-300 ' + (isExpanded ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>

              {isExpanded && (
                <div className="overflow-hidden animate-fade-in" style={{ animationDuration: '0.3s' }}>
                  <div className="bg-white rounded-2xl p-3 shadow-sm border border-teal-brand/20 mt-2 mx-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-accent" />
                      <span className="text-xs font-medium text-stone-700">{p.name}</span>
                      <span className="text-[11px] text-stone-400 ml-auto">{p.distance}</span>
                    </div>
                    <p className="text-[10px] text-stone-500 mb-2">{p.address}</p>
                    <div className="w-full h-40 rounded-xl bg-stone-100 overflow-hidden relative">
                      <iframe
                        title={'Mapa ' + p.name}
                        className="w-full h-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={'https://maps.google.com/maps?q=' + p.lat + ',' + p.lng + '&z=15&output=embed'}
                      />
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] px-2 py-1 rounded-lg shadow text-stone-400">&copy; Google Maps</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Date & Time - only when pool selected */}

            {selectedPool && (
        <div className="space-y-4 sm:space-y-5 mt-5 pt-5 border-t border-sand/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-teal-brand" />
            <p className="text-sm sm:text-base font-semibold text-stone-700">
              Wybrano: <span className="text-teal-brand">{currentPool?.name}</span>
            </p>
            <button onClick={() => { setSelectedPool(null); setExpandedMap(null); setSelectedDate(null); }} className="ml-auto text-[10px] sm:text-xs text-stone-400 underline hover:text-stone-600">
              Zmien
            </button>
          </div>

          <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800">Wybierz date i godzine</h2>

                    <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            availableDates={availableDates}
            scheduledDates={scheduledDateStrings}
            bookedDates={bookedDateStrings}
            resetKey={resetKey}
          />

                    {/* Slots appear below calendar on date select — full width, stacked vertically */}
          {selectedDate && enrichedSlots.length > 0 && !allSlotsFull && (
            <div ref={slotsRef} className="space-y-2 sm:space-y-3 mt-2">
              <p className="text-xs sm:text-sm font-medium text-stone-500 mb-1">
                {allSlotsFull ? 'Brak wolnych terminow na' : 'Dostepne terminy na'} {selectedDate.slice(8, 10)}.{selectedDate.slice(5, 7)}:
              </p>
                                                        {enrichedSlots.map((slot, idx) => {
                const isFull = (slot as any).isFull
                const remaining = (slot as any).remaining
                const hasCapacity = (slot as any).capacity > 0
                const isBookedByMe = (slot as any).isBookedByMe
                return (
                  <div
                    key={idx}
                    className={'w-full rounded-xl border transition-all ' + (isFull ? 'bg-stone-100 border-stone-200' : isBookedByMe ? 'bg-amber-50 border-amber-300' : 'bg-white border-sand/30')}
                  >
                    <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5">
                      {/* Time info */}
                      <div className="flex flex-col flex-1 min-w-0 justify-center">
                        {slot.label.includes(' - ') ? (
                          <span className={'text-sm sm:text-base font-medium truncate ' + (isFull ? 'line-through text-stone-400' : isBookedByMe ? 'text-amber-800' : 'text-stone-700')}>{slot.label}</span>
                        ) : (
                          <>
                            <span className={'text-xs sm:text-sm font-semibold truncate ' + (isFull ? 'line-through text-stone-400' : isBookedByMe ? 'text-amber-800' : 'text-stone-800')}>{slot.label}</span>
                            <span className={'text-[11px] sm:text-xs ' + (isFull ? 'line-through text-stone-400' : isBookedByMe ? 'text-amber-600' : 'text-stone-400')}>{slot.time} - {String(parseInt(slot.time) + 1).padStart(2, '0')}:00</span>
                          </>
                        )}
                      </div>
                      {/* Availability badge */}
                      {hasCapacity && remaining > 0 && !isBookedByMe && (
                        <span className="text-[10px] sm:text-xs text-green-600 font-medium whitespace-nowrap">Zostało {remaining}</span>
                      )}
                      {isBookedByMe && (
                        <span className="text-[10px] sm:text-xs text-amber-600 font-medium whitespace-nowrap">Zarezerwowano</span>
                      )}
                      {/* Add to cart button — on each available slot */}
                      {!isFull && !isBookedByMe && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (!selectedPool || !selectedDate) return
                            const id = 'single-' + selectedPool + '-' + selectedDate + '-' + slot.value + '-' + Date.now() + '-' + Math.random()
                            dispatch({
                              type: 'ADD_ITEM',
                              payload: {
                                id,
                                poolId: selectedPool,
                                type: 'single',
                                label: slot.label,
                                date: selectedDate,
                                time: slot.value,
                                price: PRICES.single,
                                quantity: 1,
                              },
                            })
                            showAnimation('Dodano: ' + slot.label)
                          }}
                          className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-teal-brand text-white text-xs sm:text-sm font-bold shadow hover:bg-teal-light active:scale-[0.97] transition-all"
                        >
                          Dodaj
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

                    {selectedDate && allSlotsFull && (
            <div className="text-center py-6 sm:py-8 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-2xl sm:text-3xl mb-2">😔</div>
              <p className="text-sm sm:text-base font-medium text-stone-500">Wszystkie terminy na ten dzien sa zajete</p>
              <p className="text-[11px] sm:text-xs text-stone-400 mt-1">Wybierz inny dzien w kalendarzu</p>
            </div>
          )}

          {/* Passes */}
          <div className="text-center text-xs sm:text-sm text-stone-400 py-1 sm:py-2">- lub kup karnet -</div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              onClick={() => {
                if (!selectedPool) return
                const id = "pass8-" + selectedPool + "-" + Date.now() + "-" + Math.random()
                dispatch({ type: "ADD_ITEM", payload: { id, poolId: selectedPool, type: "pass8", label: "Karnet na 8 zajec - " + (currentPool?.name || selectedPool), price: 299, quantity: 1 } })
                showAnimation("Karnet na 8 zajec zostal dodany do koszyka!")
              }}
              className="bg-white border border-sand/30 rounded-xl py-3 sm:py-4 px-2 text-center hover:border-teal-brand/40 hover:shadow transition-all active:scale-[0.98]"
            >
              <div className="text-[10px] sm:text-xs font-bold text-teal-brand">8 zajec</div>
              <div className="text-sm sm:text-base font-bold text-stone-800">299 zl</div>
              <div className="text-[8px] sm:text-[10px] text-stone-400">1 mies.</div>
            </button>
            <button
              onClick={() => {
                if (!selectedPool) return
                const id = "pass12-" + selectedPool + "-" + Date.now() + "-" + Math.random()
                dispatch({ type: "ADD_ITEM", payload: { id, poolId: selectedPool, type: "pass12", label: "Karnet na 12 zajec - " + (currentPool?.name || selectedPool), price: 399, quantity: 1 } })
                showAnimation("Karnet na 12 zajec zostal dodany do koszyka!")
              }}
              className="bg-white border-2 border-teal-brand/30 rounded-xl py-3 sm:py-4 px-2 text-center hover:border-teal-brand hover:shadow transition-all active:scale-[0.98] relative"
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-teal-brand text-white text-[7px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">BEST</div>
              <div className="text-[10px] sm:text-xs font-bold text-teal-brand mt-1.5">12 zajec</div>
              <div className="text-sm sm:text-base font-bold text-stone-800">399 zl</div>
              <div className="text-[8px] sm:text-[10px] text-stone-400">1,5 mies.</div>
            </button>
            <button
              onClick={() => {
                if (!selectedPool) return
                const id = "pass16-" + selectedPool + "-" + Date.now() + "-" + Math.random()
                dispatch({ type: "ADD_ITEM", payload: { id, poolId: selectedPool, type: "pass16", label: "Karnet Bezlimit - " + (currentPool?.name || selectedPool), price: 549, quantity: 1 } })
                showAnimation("Karnet Bezlimit zostal dodany do koszyka!")
              }}
              className="bg-white border border-sand/30 rounded-xl py-3 sm:py-4 px-2 text-center hover:border-teal-brand/40 hover:shadow transition-all active:scale-[0.98]"
            >
              <div className="text-[10px] sm:text-xs font-bold text-teal-brand">Bezlimit</div>
              <div className="text-sm sm:text-base font-bold text-stone-800">549 zl</div>
              <div className="text-[8px] sm:text-[10px] text-stone-400">1 mies.</div>
            </button>
          </div>

                    <div className="text-center pt-2">
            <button onClick={() => navigate('/cart')} className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-teal-brand text-white font-bold text-sm sm:text-base shadow-lg hover:bg-teal-light active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Przejdz do koszyka
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Animation */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl px-8 py-10 shadow-2xl text-center animate-bounce-in max-w-[300px] relative overflow-hidden">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-light flex items-center justify-center animate-pulse-sparkle">
              <svg className="w-8 h-8 text-green-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-stone-800 mb-1">Dodano do koszyka!</p>
            <p className="text-xs text-stone-500">{confirmItem}</p>
          </div>
        </div>
      )}
    </div>
  )
}
