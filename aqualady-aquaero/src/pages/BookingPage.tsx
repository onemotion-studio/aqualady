import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import { useCart } from '../context/CartContext'
import { useSchedule } from '../context/ScheduleContext'
import { BUILTIN_POOLS, loadPools, PRICES, type PoolId } from '../config'
import { loadBookingsFromServer } from '../lib/supabase'

export default function BookingPage() {
  const navigate = useNavigate()
  const { dispatch, state: cartState } = useCart()
  const { schedule } = useSchedule()

  const [allPools] = useState(loadPools)
  const [selectedPool, setSelectedPool] = useState<PoolId | null>(null)
  const [expandedMap, setExpandedMap] = useState<PoolId | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ value: string; label: string } | null>(null)
  const [serverBookings, setServerBookings] = useState<Record<string, number>>({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmItem, setConfirmItem] = useState('')
  const [resetKey, setResetKey] = useState(0)
  const slotsRef = useRef<HTMLDivElement>(null)

  const poolList = useMemo(() => Object.values(allPools), [allPools])

  const handlePoolClick = (poolId: PoolId) => {
    if (selectedPool === poolId) {
      setExpandedMap(null)
      setSelectedPool(null)
      setSelectedDate(null)
      setSelectedSlot(null)
    } else {
      setSelectedPool(poolId)
      setExpandedMap(poolId)
      setSelectedDate(null)
      setSelectedSlot(null)
      setResetKey(k => k + 1)
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  useEffect(() => {
    if (selectedDate && slotsRef.current) {
      setTimeout(() => {
        slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [selectedDate])

  const handleSlotSelect = (slot: { value: string; label: string }) => {
    setSelectedSlot(slot)
  }

  const showAnimation = (label: string) => {
    setConfirmItem(label)
    setShowConfirm(true)
    setTimeout(() => {
      setShowConfirm(false)
      setConfirmItem('')
    }, 1800)
  }

  const handleAddToCart = () => {
    if (!selectedPool || !selectedDate || !selectedSlot) return
    const id = 'single-' + selectedPool + '-' + selectedDate + '-' + selectedSlot.value + '-' + Date.now() + '-' + Math.random()
    const pool = allPools[selectedPool]
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id,
        poolId: selectedPool,
        type: 'single',
        label: selectedSlot.label,
        date: selectedDate,
        time: selectedSlot.value,
        price: PRICES.single,
        quantity: 1,
      },
    })
    showAnimation('Dodano: ' + selectedSlot.label)
    setSelectedDate(null)
    setSelectedSlot(null)
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

  const currentPool = selectedPool ? Object.values(allPools).find(p => p.id === selectedPool) : null
  const canAddToCart = selectedPool !== null && selectedDate !== null && selectedSlot !== null

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

  // Enhanced slots with capacity info (persisted + cart)
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
      return { ...slot, remaining, isFull, booked: totalBooked }
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
    <div className="space-y-5 pb-8 pt-4">
      <h1 className="pt-4 text-xl font-bold text-stone-800">Wybierz zajecia</h1>

      {/* Pool Selection with accordion map */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-600">Wybierz basen:</p>
        {poolList.map(p => {
          const isSelected = selectedPool === p.id
          const isExpanded = expandedMap === p.id

          return (
            <div key={p.id}>
              <button
                onClick={() => handlePoolClick(p.id)}
                className={'w-full bg-white rounded-2xl p-4 shadow-sm border text-left transition-all active:scale-[0.99] ' + (isSelected ? 'border-teal-brand shadow-md' : 'border-sand/15 hover:shadow-md hover:border-teal-brand/30')}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-bold text-stone-800">{p.name}</h3>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className={'w-3 h-3 ' + (i <= Math.floor(p.rating) ? 'text-amber-400' : 'text-stone-200')} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-[10px] text-stone-400 ml-0.5">{p.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {p.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                      {p.distance}
                    </span>
                  </div>
                  <svg className={'w-4 h-4 text-stone-400 transition-transform duration-300 ' + (isExpanded ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
        <div className="space-y-4 mt-5 pt-5 border-t border-sand/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-brand" />
            <p className="text-sm font-semibold text-stone-700">
              Wybrano: <span className="text-teal-brand">{currentPool?.name}</span>
            </p>
            <button onClick={() => { setSelectedPool(null); setExpandedMap(null); setSelectedDate(null); setSelectedSlot(null); }} className="ml-auto text-[10px] text-stone-400 underline hover:text-stone-600">
              Zmien
            </button>
          </div>

          <h2 className="text-base font-bold text-stone-800">Wybierz date i godzine</h2>

          <Calendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            availableDates={availableDates}
            scheduledDates={scheduledDateStrings}
            resetKey={resetKey}
          />

          {/* Slots appear below calendar on date select — full width, stacked vertically */}
          {selectedDate && enrichedSlots.length > 0 && !allSlotsFull && (
            <div ref={slotsRef} className="space-y-2 mt-2">
              <p className="text-xs font-medium text-stone-500 mb-1">
                {allSlotsFull ? 'Brak wolnych terminow na' : 'Dostepne terminy na'} {selectedDate.slice(8, 10)}.{selectedDate.slice(5, 7)}:
              </p>
                            {enrichedSlots.map((slot, idx) => {
                const isSlotSelected = selectedSlot?.value === slot.value
                const isFull = (slot as any).isFull
                const remaining = (slot as any).remaining
                const hasCapacity = (slot as any).capacity > 0
                return (
                  <button
                    key={idx}
                    onClick={() => !isFull && handleSlotSelect(slot)}
                    disabled={isFull}
                    className={'w-full text-left py-3.5 px-4 rounded-xl text-sm font-medium transition-all border ' + (isFull ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed' : isSlotSelected ? 'bg-teal-brand text-white border-teal-brand shadow' : 'bg-white text-stone-700 border-sand/30 hover:border-teal-brand/40 hover:shadow-sm')}
                  >
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex flex-col flex-1 min-w-0 justify-center">
                        {slot.label.includes(' - ') ? (
                          <span className={'text-sm font-medium truncate ' + (isFull ? 'line-through text-stone-400' : isSlotSelected ? 'text-white' : 'text-stone-700')}>{slot.label}</span>
                        ) : (
                          <>
                            <span className={'text-xs font-semibold truncate ' + (isFull ? 'line-through text-stone-400' : isSlotSelected ? 'text-white' : 'text-stone-800')}>{slot.label}</span>
                            <span className={'text-[11px] ' + (isFull ? 'line-through text-stone-400' : isSlotSelected ? 'text-white/80' : 'text-stone-400')}>{slot.time} - {String(parseInt(slot.time) + 1).padStart(2, '0')}:00</span>
                          </>
                        )}
                      </div>
                                            {hasCapacity && (
                        <span className={'text-base font-bold shrink-0 ' + (isFull ? 'text-red-400' : isSlotSelected ? 'text-white' : remaining <= 3 ? 'text-amber-500' : 'text-teal-brand')}>
                          {remaining}/{slot.capacity}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

                    {selectedDate && allSlotsFull && (
            <div className="text-center py-6 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="text-2xl mb-2">😔</div>
              <p className="text-sm font-medium text-stone-500">Wszystkie terminy na ten dzien sa zajete</p>
              <p className="text-[11px] text-stone-400 mt-1">Wybierz inny dzien w kalendarzu</p>
            </div>
          )}

          {/* Passes */}
          <div className="text-center text-xs text-stone-400 py-1">- lub kup karnet -</div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (!selectedPool) return
                const id = "pass8-" + selectedPool + "-" + Date.now() + "-" + Math.random()
                dispatch({ type: "ADD_ITEM", payload: { id, poolId: selectedPool, type: "pass8", label: "Karnet na 8 zajec - " + (currentPool?.name || selectedPool), price: 299, quantity: 1 } })
                showAnimation("Karnet na 8 zajec zostal dodany do koszyka!")
              }}
              className="bg-white border border-sand/30 rounded-xl py-3 px-2 text-center hover:border-teal-brand/40 hover:shadow transition-all active:scale-[0.98]"
            >
              <div className="text-[10px] font-bold text-teal-brand">8 zajec</div>
              <div className="text-sm font-bold text-stone-800">299 zl</div>
              <div className="text-[8px] text-stone-400">1 mies.</div>
            </button>
            <button
              onClick={() => {
                if (!selectedPool) return
                const id = "pass12-" + selectedPool + "-" + Date.now() + "-" + Math.random()
                dispatch({ type: "ADD_ITEM", payload: { id, poolId: selectedPool, type: "pass12", label: "Karnet na 12 zajec - " + (currentPool?.name || selectedPool), price: 399, quantity: 1 } })
                showAnimation("Karnet na 12 zajec zostal dodany do koszyka!")
              }}
              className="bg-white border-2 border-teal-brand/30 rounded-xl py-3 px-2 text-center hover:border-teal-brand hover:shadow transition-all active:scale-[0.98] relative"
            >
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-teal-brand text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">BEST</div>
              <div className="text-[10px] font-bold text-teal-brand mt-1.5">12 zajec</div>
              <div className="text-sm font-bold text-stone-800">399 zl</div>
              <div className="text-[8px] text-stone-400">1,5 mies.</div>
            </button>
            <button
              onClick={() => {
                if (!selectedPool) return
                const id = "pass16-" + selectedPool + "-" + Date.now() + "-" + Math.random()
                dispatch({ type: "ADD_ITEM", payload: { id, poolId: selectedPool, type: "pass16", label: "Karnet Bezlimit - " + (currentPool?.name || selectedPool), price: 549, quantity: 1 } })
                showAnimation("Karnet Bezlimit zostal dodany do koszyka!")
              }}
              className="bg-white border border-sand/30 rounded-xl py-3 px-2 text-center hover:border-teal-brand/40 hover:shadow transition-all active:scale-[0.98]"
            >
              <div className="text-[10px] font-bold text-teal-brand">Bezlimit</div>
              <div className="text-sm font-bold text-stone-800">549 zl</div>
              <div className="text-[8px] text-stone-400">1 mies.</div>
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={'w-full py-3.5 rounded-xl font-bold text-sm transition-all ' + (canAddToCart ? 'bg-teal-brand text-white shadow-lg hover:bg-teal-light active:scale-[0.98]' : 'bg-stone-200 text-stone-400 cursor-not-allowed')}
          >
            Dodaj do koszyka
          </button>

          <div className="text-center pt-2">
            <button onClick={() => navigate('/cart')} className="text-sm text-teal-brand font-medium underline underline-offset-4 hover:text-teal-light transition-colors">
              Przejdz do koszyka
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
