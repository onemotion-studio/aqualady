# -*- coding: utf-8 -*-
with open('src/pages/BookingPage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add cartState to destructure
content = content.replace(
    "const { dispatch } = useCart()",
    "const { dispatch, state: cartState } = useCart()"
)

# 2. Add bookedCount + enhanced slotsForSelectedDate + allSlotsFull after scheduledDateStrings
old_after_scheduled = """  const currentPool = selectedPool ? Object.values(allPools).find(p => p.id === selectedPool) : null
    const canAddToCart = selectedPool !== null && selectedDate !== null && selectedSlot !== null"""

new_after_scheduled = """  const currentPool = selectedPool ? Object.values(allPools).find(p => p.id === selectedPool) : null
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
    // Load persisted bookings
    let persisted: Record<string, number> = {}
    try {
      const raw = localStorage.getItem('aqualady_bookings')
      if (raw) persisted = JSON.parse(raw)
    } catch {}
    return entry.slots.map(slot => {
      const key = selectedPool + '|' + selectedDate + '|' + slot.value
      const persistedBooked = persisted[key] || 0
      const cartBooked = bookedCount.get(key) || 0
      const totalBooked = persistedBooked + cartBooked
      const capacity = slot.capacity || 0
      const remaining = capacity > 0 ? capacity - totalBooked : -1
      const isFull = capacity > 0 && remaining <= 0
      return { ...slot, remaining, isFull, booked: totalBooked }
    })
  }, [selectedPool, selectedDate, schedule, bookedCount])

  // Check if ALL slots for selected date are full
  const allSlotsFull = useMemo(() => {
    return enrichedSlots.length > 0 && enrichedSlots.every(s => (s as any).isFull)
  }, [enrichedSlots])"""

content = content.replace(old_after_scheduled, new_after_scheduled)

# 3. Update availableDates to include allSlotsFull
old_avail = """    const availableDates = useMemo(() => {
      if (!selectedPool) return []
      const entries = schedule.filter(e => e.poolId === selectedPool && e.slots.length > 0)
      return entries.map(e => ({
        date: e.date,
        slots: e.slots.map(s => ({ label: s.label, time: s.time, value: s.value })),
      }))
    }, [selectedPool, schedule])"""

new_avail = """    const availableDates = useMemo(() => {
      if (!selectedPool) return []
      const entries = schedule.filter(e => e.poolId === selectedPool && e.slots.length > 0)
      return entries.map(e => {
        const slots = e.slots.map(s => ({ label: s.label, time: s.time, value: s.value }))
        // Check if all slots on this date are fully booked
        let persisted: Record<string, number> = {}
        try {
          const raw = localStorage.getItem('aqualady_bookings')
          if (raw) persisted = JSON.parse(raw)
        } catch {}
        const allFull = slots.every(s => {
          const key = selectedPool + '|' + e.date + '|' + s.value
          const persistedBooked = persisted[key] || 0
          const cartKey = selectedPool + '|' + e.date + '|' + s.value
          const cartBooked = bookedCount.get(cartKey) || 0
          const totalBooked = persistedBooked + cartBooked
          const origSlot = e.slots.find(es => es.value === s.value)
          const cap = origSlot?.capacity || 0
          return cap > 0 && totalBooked >= cap
        })
        return { date: e.date, slots, allSlotsFull: allFull }
      })
    }, [selectedPool, schedule, bookedCount])"""

content = content.replace(old_avail, new_avail)

# 4. Replace slotsForSelectedDate usage in JSX with enrichedSlots
content = content.replace(
    "{selectedDate && slotsForSelectedDate.length > 0 && (",
    "{selectedDate && enrichedSlots.length > 0 && !allSlotsFull && ("
)

content = content.replace(
    "Dostepne terminy na {selectedDate.slice(8, 10)}.{selectedDate.slice(5, 7)}:",
    "{allSlotsFull ? 'Brak wolnych terminow na' : 'Dostepne terminy na'} {selectedDate.slice(8, 10)}.{selectedDate.slice(5, 7)}:"
)

# 5. Replace slot buttons with enriched version
old_slot_buttons = """                {slotsForSelectedDate.map((slot, idx) => {
                  const isSlotSelected = selectedSlot?.value === slot.value
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSlotSelect(slot)}
                      className={'w-full text-left py-3.5 px-4 rounded-xl text-sm font-medium transition-all border ' + (isSlotSelected ? 'bg-teal-brand text-white border-teal-brand shadow' : 'bg-white text-stone-700 border-sand/30 hover:border-teal-brand/40 hover:shadow-sm')}
                    >
                      {slot.label}
                    </button>
                  )
                })}"""

new_slot_buttons = """                {enrichedSlots.map((slot, idx) => {
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
                      <span className={isFull ? 'line-through text-stone-400' : ''}>{slot.label}</span>
                      {hasCapacity && (
                        <span className={'ml-2 text-[10px] ' + (isFull ? 'text-red-400' : 'text-teal-brand')}>
                          ({remaining}/{slot.capacity})
                        </span>
                      )}
                    </button>
                  )
                })}"""

content = content.replace(old_slot_buttons, new_slot_buttons)

# 6. Add "all slots full" message before passes
old_before_passes = """            {/* Passes */}\n            <div className=\"text-center text-xs text-stone-400 py-1\">- lub kup karnet -</div>"""

new_before_passes = """          {selectedDate && allSlotsFull && (\n            <div className=\"text-center py-6 bg-stone-50 rounded-2xl border border-stone-200\">\n              <div className=\"text-2xl mb-2\">\U0001F614</div>\n              <p className=\"text-sm font-medium text-stone-500\">Wszystkie terminy na ten dzien sa zajete</p>\n              <p className=\"text-[11px] text-stone-400 mt-1\">Wybierz inny dzien w kalendarzu</p>\n            </div>\n          )}\n\n            {/* Passes */}\n            <div className=\"text-center text-xs text-stone-400 py-1\">- lub kup karnet -</div>"""

content = content.replace(old_before_passes, new_before_passes)

# 7. Add persist to handleAddToCart
old_handle_add = """  const handleAddToCart = () => {
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
    }"""

new_handle_add = """  const handleAddToCart = () => {
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
      // Persist booking locally
      try {
        const raw = localStorage.getItem('aqualady_bookings')
        const bookings = raw ? JSON.parse(raw) : {}
        const key = selectedPool + '|' + selectedDate + '|' + selectedSlot.value
        bookings[key] = (bookings[key] || 0) + 1
        localStorage.setItem('aqualady_bookings', JSON.stringify(bookings))
      } catch {}
      showAnimation('Dodano: ' + selectedSlot.label)
      setSelectedDate(null)
      setSelectedSlot(null)
    }"""

content = content.replace(old_handle_add, new_handle_add)

with open('src/pages/BookingPage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
