import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { loadPools, type PoolConfig } from '../config'
import { loadBookingsFromServer, addBookingToServer, linkBookingsToUser } from '../lib/supabase'

const whatToBring = [
  { icon: '\u{1F3CA}', text: 'Czepek kapielowy' },
  { icon: '\u{1FA74}', text: 'Stroj kapielowy / Kapielowki' },
  { icon: '\u{1FA71}', text: 'Klapki' },
]

export default function CartPage() {
    const navigate = useNavigate()
  const { state, dispatch } = useCart()
  const { user } = useAuth()
  const { items } = state
  const [allPools] = useState<Record<string, PoolConfig>>(loadPools)
    const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoError, setPromoError] = useState('')
  const [promoApplied, setPromoApplied] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [accepted, setAccepted] = useState(false)
    const [serverBookings, setServerBookings] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [createAccount, setCreateAccount] = useState(false)
  const [password, setPassword] = useState('')

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

  const applyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase()
    if (!code) return
    setPromoLoading(true)
    setPromoError('')
    try {
      const res = await fetch('https://yrkocsmphipndklgpopd.supabase.co/rest/v1/promocodes?code=eq.' + code + '&select=*', {
        headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0' }
      })
      const data = await res.json()
      if (!data || data.length === 0) {
        setPromoError('Kod nie istnieje')
        setPromoDiscount(0)
        setPromoApplied('')
      } else {
        const p = data[0]
        if (!p.is_active) {
          setPromoError('Kod jest nieaktywny')
          setPromoDiscount(0)
          setPromoApplied('')
          return
        }
        if (p.expires_at && new Date(p.expires_at) < new Date()) {
          setPromoError('Kod wygasł')
          setPromoDiscount(0)
          setPromoApplied('')
          return
        }
                if (p.max_uses > 0 && p.used_count >= p.max_uses) {
          setPromoError('Kod został już wykorzystany')
          setPromoDiscount(0)
          setPromoApplied('')
          return
        }
        // Check pool_id restriction
        if (p.pool_id) {
          const hasMatchingPool = items.some(item => item.poolId === p.pool_id)
          if (!hasMatchingPool) {
            setPromoError('Kod działa tylko na wybrany basen')
            setPromoDiscount(0)
            setPromoApplied('')
            return
          }
        }
        // Check date restriction
        if (p.date) {
          const hasMatchingDate = items.some(item => item.date === p.date)
          if (!hasMatchingDate) {
            setPromoError('Kod działa tylko na wybraną datę')
            setPromoDiscount(0)
            setPromoApplied('')
            return
          }
        }
                // Check time_slot restriction (может быть несколько через запятую)
        if (p.time_slot) {
          const allowedSlots = p.time_slot.split(',').filter(Boolean)
          const hasMatchingSlot = items.some(item =>
            allowedSlots.some((slot: string) => item.time === slot || item.time === 'slot_' + slot.replace(':', ''))
          )
          if (!hasMatchingSlot) {
            setPromoError('Kod działa tylko na wybrane godziny')
            setPromoDiscount(0)
            setPromoApplied('')
            return
          }
        }
        // Check min_quantity restriction
        if (p.min_quantity && p.min_quantity > 0) {
          const totalQty = items.reduce((s, item) => s + item.quantity, 0)
          if (totalQty < p.min_quantity) {
            setPromoError(`Minimalna liczba zajęć: ${p.min_quantity}`)
            setPromoDiscount(0)
            setPromoApplied('')
            return
          }
        }
        if (p.discount_type === 'percent') {
          setPromoDiscount(Math.round(total * p.discount_value / 100))
        } else {
          setPromoDiscount(Math.min(p.discount_value, total))
        }
        setPromoApplied(code)
        setPromoError('')
      }
    } catch {
      setPromoError('Błąd sprawdzania kodu')
    }
    setPromoLoading(false)
  }

  const totalAfterDiscount = Math.max(0, total - promoDiscount)

  const getPoolName = (poolId: string) => {
    return allPools[poolId]?.name || poolId
  }

    const getItemSubtitle = (item: typeof items[0]) => {
    if (item.type === 'subscription') {
      return 'Abonament miesięczny'
    }
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
    if (!email || !name || !accepted || items.length === 0) return
    setLoading(true)
    // Save all single-session items to server bookings
        const singleItems = items.filter(item => item.type === 'single' && item.poolId && item.date && item.time) as typeof items
        for (const item of singleItems) {
          await addBookingToServer(item.poolId, item.date as string, item.time as string, item.quantity, email, name)
        }

        // Send confirmation email via Edge Function
    try {
      const emailItems = singleItems.map(item => ({
        poolName: item.poolId,
        date: item.date,
        time: item.time,
        quantity: item.quantity,
        price: item.price * item.quantity,
      }))
      await fetch('https://yrkocsmphipndklgpopd.supabase.co/functions/v1/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0',
        },
        body: JSON.stringify({ email, name, items: emailItems, total }),
      })
        } catch (e) {
      console.error('Failed to send confirmation email:', e)
    }

        // Increment promocode usage count
    if (promoApplied) {
      try {
        const res = await fetch('https://yrkocsmphipndklgpopd.supabase.co/rest/v1/promocodes?code=eq.' + promoApplied + '&select=*', {
          headers: { apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0' }
        })
        const data = await res.json()
        if (data && data.length > 0) {
          const p = data[0]
          await fetch('https://yrkocsmphipndklgpopd.supabase.co/rest/v1/promocodes?id=eq.' + p.id, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlya29jc21waGlwbmRrbGdwb3BkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MzU0NzAsImV4cCI6MjA5NjQxMTQ3MH0.xbmnA0hSIrOm9N-pmvkBlyArFrdaBwj_-74Z4eIuR_0',
            },
            body: JSON.stringify({ used_count: (p.used_count || 0) + 1 }),
          })
        }
      } catch (e) {
        console.error('Failed to increment promocode:', e)
      }
    }

        // If user checked "create account" — sign them up after booking
    if (createAccount && password) {
      try {
        const { supabase: sb } = await import('../lib/supabase')
        if (sb) {
          const { data, error } = await sb.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
          })
          if (!error && data.user) {
            await linkBookingsToUser(email, data.user.id)
          }
        }
      } catch (e) {
        console.error('Failed to create account:', e)
      }
    }

    // Clear cart
    dispatch({ type: 'CLEAR_CART' })
    setLoading(false)
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
                    <p className="text-xs sm:text-sm text-teal-brand font-semibold capitalize mb-0.5">{getPoolName(item.poolId)}</p>
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
                  <span className="text-xs sm:text-sm text-stone-400 ml-1">{item.price} zl / szt.</span>
                </div>
              </div>
            ))}
          </div>

                    {/* Promo code */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10">
            <p className="text-xs sm:text-sm font-medium text-stone-600 mb-2">Kod promocyjny</p>
            {promoApplied ? (
              <div className="flex items-center justify-between bg-teal-50 rounded-xl px-4 py-3 border border-teal-200">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-semibold text-teal-700">{promoApplied}</span>
                  <span className="text-sm text-teal-600">-{promoDiscount} zł</span>
                </div>
                <button
                  onClick={() => { setPromoApplied(''); setPromoDiscount(0); setPromoCode('') }}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={promoCode}
                  onChange={e => { setPromoCode(e.target.value); setPromoError('') }}
                  placeholder="Wpisz kod"
                  className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none uppercase"
                />
                <button
                  onClick={applyPromoCode}
                  disabled={!promoCode.trim() || promoLoading}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-teal-brand text-white text-sm font-medium hover:bg-teal-light active:scale-[0.98] transition-all disabled:bg-stone-200 disabled:text-stone-400"
                >
                  {promoLoading ? '...' : 'Zastosuj'}
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-500 mt-1.5">{promoError}</p>}
          </div>

                    {/* Suma / Do zaplaty */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10 space-y-1.5">
            <div className="flex items-center justify-between text-sm sm:text-base text-stone-600">
              <span>Suma:</span>
              <span>{total} zł</span>
            </div>
            {promoDiscount > 0 && (
              <div className="flex items-center justify-between text-sm sm:text-base text-teal-600">
                <span>Zniżka ({promoApplied}):</span>
                <span>-{promoDiscount} zł</span>
              </div>
            )}
            <div className="flex items-center justify-between text-base sm:text-lg font-extrabold text-stone-800 border-t border-sand/20 pt-2">
              <span>Do zapłaty:</span>
              <span className="text-teal-brand">{totalAfterDiscount} zł</span>
            </div>
          </div>

          {/* What to bring - after sum */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5">
            <p className="text-xs sm:text-sm font-semibold text-amber-800 mb-3">Co zabrac ze soba?</p>
            <div className="flex flex-col gap-2 sm:gap-3">
              {whatToBring.map((item, i) => (
                <span key={i} className="text-sm sm:text-base text-amber-700 flex items-center gap-2">
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

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs sm:text-sm font-medium text-stone-600">Imię i nazwisko</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jan Kowalski"
              className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
            />
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
                        <p className="text-xs sm:text-sm text-stone-400">Na ten adres wyslemy potwierdzenie rezerwacji. {!user && 'Rejestracja nie jest wymagana.'}</p>
          </div>

          {/* Create account — only for non-logged-in users */}
          {!user && (
            <div className="space-y-3 bg-teal-50 rounded-2xl p-4 sm:p-5 border border-teal-200">
              <label className="flex items-start gap-2 text-xs sm:text-sm text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={e => setCreateAccount(e.target.checked)}
                  className="mt-0.5 accent-teal-brand"
                />
                <span>
                  <span className="font-medium text-teal-700">Utworz konto</span>
                  {' '}— bedziesz widziec swoje rezerwacje i zarzadzac nimi
                </span>
              </label>
              {createAccount && (
                <div className="space-y-1 pl-6">
                  <label className="text-xs sm:text-sm font-medium text-stone-600">Haslo (min. 6 znakow)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Twoje haslo"
                    required={createAccount}
                    minLength={6}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Checkbox */}
          <label className="flex items-start gap-2 text-xs sm:text-sm text-stone-500">
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
                        disabled={!email || !name || !accepted || items.length === 0 || loading}
            className={'w-full py-4 sm:py-5 rounded-2xl sm:rounded-3xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ' + (email && name && accepted && items.length > 0 && !loading ? 'bg-teal-brand text-white shadow-lg hover:bg-teal-light active:scale-[0.98]' : 'bg-stone-200 text-stone-400 cursor-not-allowed')}
          >
            {loading ? 'Proszę czekać...' : <>Zarezerwuj <span className="text-base sm:text-lg">{totalAfterDiscount} zł</span></>}
          </button>

          {/* Payment methods */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-stone-400">
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
