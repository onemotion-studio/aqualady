import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from '../components/Calendar'
import { useCart } from '../context/CartContext'
import { POOLS, PRICES, type PoolId } from '../config'

export default function BookingPage() {
  const navigate = useNavigate()
  const { dispatch } = useCart()

  const [selectedPool, setSelectedPool] = useState<PoolId | null>(null)
  const [expandedMap, setExpandedMap] = useState<PoolId | null>(null)
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<'morning' | 'evening'>('morning')
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmItem, setConfirmItem] = useState('')
  const [resetKey, setResetKey] = useState(0)

  const poolList = Object.values(POOLS)

  const handlePoolClick = (poolId: PoolId) => {
    setSelectedPool(poolId)
    if (expandedMap === poolId) {
      setExpandedMap(null)
    } else {
      setExpandedMap(poolId)
    }
    setSelectedDates([])
    setResetKey(k => k + 1)
  }

  const handleDateToggle = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    )
  }

  const showAnimation = (label: string) => {
    setConfirmItem(label)
    setShowConfirm(true)
    setTimeout(() => {
      setShowConfirm(false)
      setConfirmItem('')
    }, 1800)
  }

  const addSingleSession = () => {
    if (!selectedPool || selectedDates.length === 0) return
    selectedDates.forEach(date => {
      const id = `single-${selectedPool}-${date}-${selectedTime}-${Date.now()}-${Math.random()}`
      const timeLabel = selectedTime === 'morning' ? 'Poranna' : 'Wieczorna'
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          id,
          poolId: selectedPool,
          type: 'single',
          label: `Zajęcia ${timeLabel} — ${date.slice(8, 10)}.${date.slice(5, 7)}`,
          date,
          time: selectedTime,
          price: PRICES.single,
        },
      })
    })
    const count = selectedDates.length
    showAnimation(`Zajęcia zostały dodane do koszyka! (${count} ${count === 1 ? 'zajęcie' : count < 5 ? 'zajęcia' : 'zajęć'})`)
    setSelectedDates([])
  }

  const addPass = (type: 'pass8' | 'pass12' | 'pass16') => {
    if (!selectedPool) return
    const labelMap = { pass8: 'Karnet na 8 zajęć', pass12: 'Karnet na 12 zajęć', pass16: 'Karnet na 16 zajęć' }
    const label = labelMap[type] || 'Karnet'
    const id = `${type}-${selectedPool}-${Date.now()}-${Math.random()}`
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id,
        poolId: selectedPool,
        type,
        label: `${label} — ${POOLS[selectedPool].name}`,
        price: PRICES[type],
      },
    })
    showAnimation(`${label} został dodany do koszyka!`)
  }

  const currentPool = selectedPool ? POOLS[selectedPool] : null

  return (
    <div className="space-y-5 pb-8 pt-4">
      <h1 className="pt-4 text-xl font-bold text-stone-800">Wybierz zajęcia</h1>

      {/* Pool Selection with accordion map */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-600">Wybierz basen:</p>
        {poolList.map(p => {
          const isSelected = selectedPool === p.id.toUpperCase() as PoolId
          const isExpanded = expandedMap === p.id.toUpperCase() as PoolId
          const poolId = p.id.toUpperCase() as PoolId

          return (
            <div key={p.id}>
              <button
                onClick={() => handlePoolClick(poolId)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm border text-left transition-all active:scale-[0.99] ${isSelected
                    ? 'border-teal-brand shadow-md'
                    : 'border-sand/15 hover:shadow-md hover:border-teal-brand/30'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-bold text-stone-800">{p.name}</h3>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className={`w-3 h-3 ${i <= Math.floor(p.rating) ? 'text-amber-400' : 'text-stone-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-[10px] text-stone-400 ml-0.5">{p.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {p.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {p.distance}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Accordion Map */}
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
                        title={`Mapa ${p.name}`}
                        className="w-full h-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${p.lat},${p.lng}&z=15&output=embed`}
                      />
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] px-2 py-1 rounded-lg shadow text-stone-400">
                        &copy; Google Maps
                      </div>
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
            <button
              onClick={() => { setSelectedPool(null); setExpandedMap(null); setSelectedDates([]); }}
              className="ml-auto text-[10px] text-stone-400 underline hover:text-stone-600"
            >
              Zmień
            </button>
          </div>

          {/* Time Selector */}
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Wybierz porę zajęć:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTime('morning')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${selectedTime === 'morning'
                    ? 'bg-teal-brand text-white border-teal-brand shadow'
                    : 'bg-white text-stone-600 border-sand/30 hover:border-teal-brand/40'
                }`}
              >
                🌅 Poranna (9:00)
              </button>
              <button
                onClick={() => setSelectedTime('evening')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${selectedTime === 'evening'
                    ? 'bg-teal-brand text-white border-teal-brand shadow'
                    : 'bg-white text-stone-600 border-sand/30 hover:border-teal-brand/40'
                }`}
              >
                🌇 Wieczorna (17:00)
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">
              Wybierz daty (klikaj, aby zaznaczyć):
            </p>
            <Calendar
              selectedDates={selectedDates}
              onDateToggle={handleDateToggle}
              resetKey={resetKey}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={addSingleSession}
              disabled={selectedDates.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${selectedDates.length === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-teal-brand text-white shadow-lg hover:bg-teal-light active:scale-[0.98]'
              }`}
            >
              Dodaj wybrane zajęcia · {selectedDates.length} × {PRICES.single} zł
            </button>

            <div className="text-center text-xs text-stone-400 py-1">— lub kup karnet —</div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => addPass('pass8')}
                className="bg-white border border-sand/30 rounded-xl py-3 px-2 text-center hover:border-teal-brand/40 hover:shadow transition-all active:scale-[0.98]"
              >
                <div className="text-[10px] font-bold text-teal-brand">8 zajęć</div>
                <div className="text-sm font-bold text-stone-800">{PRICES.pass8} zł</div>
                <div className="text-[8px] text-stone-400">1 mies.</div>
              </button>
              <button
                onClick={() => addPass('pass12')}
                className="bg-white border-2 border-teal-brand/30 rounded-xl py-3 px-2 text-center hover:border-teal-brand hover:shadow transition-all active:scale-[0.98] relative"
              >
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-teal-brand text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                  BEST
                </div>
                <div className="text-[10px] font-bold text-teal-brand mt-1.5">12 zajęć</div>
                <div className="text-sm font-bold text-stone-800">{PRICES.pass12} zł</div>
                <div className="text-[8px] text-stone-400">1,5 mies.</div>
              </button>
              <button
                onClick={() => addPass('pass16')}
                className="bg-white border border-sand/30 rounded-xl py-3 px-2 text-center hover:border-teal-brand/40 hover:shadow transition-all active:scale-[0.98]"
              >
                <div className="text-[10px] font-bold text-teal-brand">Bezlimit</div>
                <div className="text-sm font-bold text-stone-800">{PRICES.pass16} zł</div>
                <div className="text-[8px] text-stone-400">1 mies.</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/cart')}
              className="text-sm text-teal-brand font-medium underline underline-offset-4 hover:text-teal-light transition-colors"
            >
              Przejdź do koszyka →
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
            <p className="text-sm font-semibold text-stone-800 mb-1">✓ Dodano do koszyka!</p>
            <p className="text-xs text-stone-500">{confirmItem}</p>
          </div>
        </div>
      )}
    </div>
  )
}
