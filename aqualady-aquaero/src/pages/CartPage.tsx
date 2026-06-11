import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { loadPools, type PoolConfig } from '../config'
import { loadBookingsFromServer, addBookingToServer } from '../lib/supabase'

const whatToBring = [
  { icon: '\u{1F3CA}', text: 'Czepek kapielowy' },
  { icon: '\u{1FA74}', text: 'Stroj kapielowy / Kapielowki' },
  { icon: '\u{1FA71}', text: 'Klapki' },
]

export default function CartPage() {
  const navigate = useNavigate()
  const { state, dispatch } = useCart()
  const { items } = state
  const [allPools] = useState<Record<string, PoolConfig>>(loadPools)
  const [promoCode, setPromoCode] = useState('')
  const [email, setEmail] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [serverBookings, setServerBookings] = useState<Record<string, number>>({})

  // Load server bookings for capacity check
  useEffect(() => {
    loadBookingsFromServer().then(data => {
      const map: Record<string, number> = {}
      data.forEach(b => {
        const key = b.pool_id + '|' + b.date + '|' + b.time
        map[key] = (map[key] || 0) + b.quantity
      })
      setServerBookings(map)
    }).catch(() => {})
  }, [])

  // Load schedule for slot capacities
  const [slotCapacity, setSlotCapacity] = useState<Record<string, number>>({})
  useEffect(() => {
    fetch('https://yrkocsmphipndklgpopd.supabase.co/rest/v1/schedule', {
      headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0' }
    }).then(r => r.json()).then(data => {
      const map: Record<string, number> = {}
      data.forEach((entry: any) => {
        const slots = typeof entry.slots === 'string' ? JSON.parse(entry.slots) : entry.slots
        slots.forEach((s: any) => {
          const key = entry.pool_id + '|' + entry.date + '|' + s.value
          if (s.capacity) map[key] = s.capacity
        })
      })
      setSlotCapacity(map)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const doScroll = () => {
      window.scrollTo(0, 0)
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    doScroll()
    requestAnimationFrame(doScroll)
    setTimeout(doScroll, 50)
    setTimeout(doScroll, 150)
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getPoolName = (poolId: string) => {
    return allPools[poolId]?.name || poolId
  }

  const getItemSubtitle = (item: typeof items[0]) => {
    const parts: string[] = []
    parts.push('Zajecie')
    if (item.date) {
      parts.push(item.date.slice(8, 10) + '.' + item.date.slice(5, 7))
    }
    if (item.time) {
      const hour = parseInt(item.time.split('_')[1] || item.time.replace('slot_', '').slice(0, 2))
      if (!isNaN(hour)) {
        parts.push(hour < 12 ? 'Poranna' : 'Wieczorna')
      } else {
        parts.push(item.time === 'morning' ? 'Poranna' : 'Wieczorna')
      }
    }
    return parts.join(' \u00b7 ')
  }

  const handleReserve = async () => {
    if (!email || !accepted || items.length === 0) return
    // Save all single-session items to server bookings
    for (const item of items) {
      if (item.type === 'single' && item.poolId && item.date && item.time) {
        await addBookingToServer(item.poolId, item.date, item.time, item.quantity, email)
      }
    }
    // Clear cart
    dispatch({ type: 'CLEAR_CART' })
    // Show confirmation
    alert('Rezerwacja zostala zlozona! Szczegoly zostaly wyslane na ' + email)
    navigate('/')
  }

  return (
        <div className="space-y-4 sm:space-y-5 pb-8 sm:pb-10 pt-4 max-w-2xl mx-auto">
      <h1 className="pt-4 text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">Koszyk</h1>

      {/* Items */}
      {items.length === 0 ? (
        <div className="text-center py-10 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full bg-stone-100 flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-stone-500">Koszyk jest pusty</p>
          <button
            onClick={() => navigate('/booking')}
            className="mt-3 text-sm sm:text-base text-teal-brand font-medium underline underline-offset-4"
          >
            Przejdz do wyboru zajec
          </button>
        </div>
      ) : (
        <>
          {/* Items list */}
          <div className="space-y-2 sm:space-y-3">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-[11px] sm:text-xs text-teal-brand font-semibold capitalize mb-0.5">{getPoolName(item.poolId)}</p>
                    <h3 className="text-sm sm:text-base font-semibold text-stone-800">{item.label}</h3>
                    <p className="text-xs sm:text-sm text-stone-400 mt-0.5">{getItemSubtitle(item)}</p>
                  </div>
                  <div className="text-right shrink-0 flex items-start gap-2">
                    <p className="text-sm sm:text-base font-bold text-stone-800">{item.price * item.quantity} zl</p>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                      className="text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {/* Quantity controls */}
                <div className="flex items-center gap-2 sm:gap-3 mt-3 pt-2 border-t border-sand/10">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity - 1 } })}
                    disabled={item.quantity <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 disabled:opacity-30 transition-all active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                  </button>
                  <span className="text-sm sm:text-base font-bold text-stone-700 min-w-[24px] text-center">{item.quantity}</span>
                                    <button
                    onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, quantity: item.quantity + 1 } })}
                    disabled={item.type === 'single' && item.poolId && item.date && item.time ? (() => { const capKey = item.poolId + '|' + item.date + '|' + item.time; const booked = serverBookings[capKey] || 0; const cap = slotCapacity[capKey] || 0; return cap > 0 && (booked + item.quantity) >= cap })() : false}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-all active:scale-90"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>
                  <span className="text-[10px] sm:text-xs text-stone-400 ml-1">{item.price} zl / szt.</span>
                </div>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10">
            <p className="text-xs sm:text-sm font-medium text-stone-600 mb-2">Kod promocyjny</p>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Wpisz kod"
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              />
              <button className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-teal-brand text-white text-sm font-medium hover:bg-teal-light active:scale-[0.98] transition-all">
                Zastosuj
              </button>
            </div>
          </div>

          {/* Suma / Do zaplaty */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10 space-y-1.5">
            <div className="flex items-center justify-between text-sm sm:text-base text-stone-600">
              <span>Suma:</span>
              <span>{total} zl</span>
            </div>
            <div className="flex items-center justify-between text-base sm:text-lg font-extrabold text-stone-800 border-t border-sand/20 pt-2">
              <span>Do zaplaty:</span>
              <span className="text-teal-brand">{total} zl</span>
            </div>
          </div>

          {/* What to bring - after sum */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm font-semibold text-amber-800 mb-3">Co zabrac ze soba?</p>
            <div className="flex flex-col gap-2 sm:gap-3">
              {whatToBring.map((item, i) => (
                <span key={i} className="text-xs sm:text-sm text-amber-700 flex items-center gap-2">
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" stroke="#16a34a" />
                    </svg>
                  </span>
                  <span>{item.icon}</span>
                  {item.text}
                </span>
              ))}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-stone-600">E-mail do potwierdzenia</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
            />
            <p className="text-[10px] sm:text-xs text-stone-400">Na ten adres wyslemy paragon z kodem dostepu. Rejestracja nie jest wymagana.</p>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-2 text-[11px] sm:text-sm text-stone-500">
            <input
              type="checkbox"
              checked={accepted}
              onChange={e => setAccepted(e.target.checked)}
              className="mt-0.5 accent-teal-brand"
            />
            <span>
              Akceptuje{' '}
              <a href="#" className="underline text-teal-brand">polityke prywatnosci</a>
              {' '}i{' '}
              <a href="#" className="underline text-teal-brand">regulamin zajec</a>.
            </span>
          </label>

          {/* Reserve button */}
          <button
            onClick={handleReserve}
            disabled={!email || !accepted || items.length === 0}
            className={'w-full py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ' + (email && accepted && items.length > 0 ? 'bg-teal-brand text-white shadow-lg hover:bg-teal-light active:scale-[0.98]' : 'bg-stone-200 text-stone-400 cursor-not-allowed')}
          >
            Zarezerwuj <span className="text-base sm:text-lg">{total} zl</span>
          </button>

          {/* Payment methods */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-stone-400">
            <span>Bezpieczna platnosc</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="0.5" fill="none"/><text x="5" y="15" fontSize="6" fontWeight="bold">BLIK</text></svg>
              Blik
            </span>
            <span>Visa</span>
            <span>Mastercard</span>
          </div>
        </>
      )}
    </div>
  )
}
