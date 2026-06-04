import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { POOLS, type PoolId } from '../config'

const whatToBring = [
  { icon: '🏊', text: 'Czepek kąpielowy' },
  { icon: '🩱', text: 'Strój kąpielowy / Kąpielówki' },
  { icon: '🩴', text: 'Klapki' },
]

const privacyText = `Polityka Prywatności Aqualady Aquaero

Administratorem danych jest Aqualady Aquaero.
Adres e-mail jest wykorzystywany wyłącznie do przesłania potwierdzenia zakupu oraz kodu dostępu na zajęcia.
Płatności są obsługiwane przez bezpiecznych zewnętrznych operatorów (Blik, karty płatnicze).
Klient ma prawo do wglądu i usunięcia swoich danych.`

export default function CartPage() {
  const { state, dispatch } = useCart()
  const [promoCode, setPromoCode] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [email, setEmail] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const total = state.items.reduce((sum, item) => sum + item.price, 0)
  const discount = promoCode.toUpperCase() === 'SENIOR10' ? total * 0.1 : 0
  const finalTotal = total - discount

  const itemsByPool = state.items.reduce<Record<string, typeof state.items>>((acc, item) => {
    const key = item.poolId
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const handleRemove = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const handlePayment = () => {
    if (!agreed || !email) return
    setShowPayment(true)
    setTimeout(() => {
      alert(`Dziękujemy! Kod dostępu został wysłany na adres ${email}`)
      dispatch({ type: 'CLEAR_CART' })
      setShowPayment(false)
    }, 1500)
  }

  if (state.items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-sand-light flex items-center justify-center">
          <svg className="w-10 h-10 text-sand-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-stone-700 mb-1">Koszyk jest pusty</h2>
        <p className="text-sm text-stone-400 mb-6">Wybierz zajęcia, aby rozpocząć</p>
        <a
          href="/booking"
          className="inline-block bg-teal-brand text-white font-bold px-8 py-3 rounded-xl shadow hover:bg-teal-light transition-all"
        >
          Wybierz zajęcia
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8">
      <h1 className="pt-4 text-xl font-bold text-stone-800">Koszyk</h1>

      {/* Items grouped by pool */}
      {Object.entries(itemsByPool).map(([poolId, items]) => (
        <div key={poolId} className="bg-white rounded-2xl shadow-sm border border-sand/20 overflow-hidden">
          <div className="bg-teal-brand/10 px-4 py-2.5 border-b border-sand/20">
            <p className="text-xs font-bold text-teal-brand">
              {POOLS[poolId as PoolId]?.name || poolId}
            </p>
          </div>
          <div className="divide-y divide-sand/10">
            {items.map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-teal-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.type !== 'single' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      ) : item.time === 'morning' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      )}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{item.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.type !== 'single' && (
                        <span className="text-[10px] bg-teal-brand/10 text-teal-brand px-1.5 py-0.5 rounded-full font-medium">
                          {item.type === 'pass8' ? 'Karnet 8' : item.type === 'pass12' ? 'Karnet 12' : item.type === 'pass16' ? 'Bezlimit' : ''}
                        </span>
                      )}
                      {item.type === 'single' && item.time && (
                        <span className="text-[10px] bg-sand-light text-stone-600 px-1.5 py-0.5 rounded-full">
                          {item.time === 'morning' ? 'Poranna' : 'Wieczorna'}
                        </span>
                      )}
                      {item.date && (
                        <span className="text-[10px] text-stone-400">
                          {item.date.slice(8, 10)}.{item.date.slice(5, 7)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-stone-800">{item.price} zł</span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-light text-stone-400 hover:text-red-accent transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* What to bring */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
        <h3 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Co zabrać ze sobą?
        </h3>
        <div className="space-y-2">
          {whatToBring.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-green-light flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-green-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm text-stone-600">{item.icon} {item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Promo Code */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
        <h3 className="text-sm font-bold text-stone-700 mb-2">Kod promocyjny</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Wpisz kod"
            className="flex-1 px-3 py-2.5 rounded-xl border border-sand/30 text-sm focus:outline-none focus:border-teal-brand/50 focus:ring-2 focus:ring-teal-brand/10"
          />
          <button
            onClick={() => setPromoCode(p => p)}
            className="px-4 py-2.5 bg-sand-light text-stone-700 rounded-xl text-sm font-medium hover:bg-sand transition-colors"
          >
            Zastosuj
          </button>
        </div>
        {promoCode === 'SENIOR10' && (
          <p className="text-xs text-green-accent mt-1.5">✓ Kod aktywowany! Rabat 10%</p>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-stone-500">
            <span>Suma:</span>
            <span>{total} zł</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-accent font-medium">
              <span>Rabat (10%):</span>
              <span>-{discount.toFixed(0)} zł</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-stone-800 pt-1.5 border-t border-sand/20">
            <span>Do zapłaty:</span>
            <span>{finalTotal.toFixed(0)} zł</span>
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/20">
        <h3 className="text-sm font-bold text-stone-700 mb-2">E-mail do potwierdzenia</h3>
        <p className="text-[11px] text-stone-400 mb-2">
          Na ten adres wyślemy paragon z kodem dostępu. Rejestracja nie jest wymagana.
        </p>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Twój adres e-mail"
          className="w-full px-3 py-2.5 rounded-xl border border-sand/30 text-sm focus:outline-none focus:border-teal-brand/50 focus:ring-2 focus:ring-teal-brand/10"
        />
      </div>

      {/* Agreement */}
      <label className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-sand/20 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-sand/30 text-teal-brand focus:ring-teal-brand/30 accent-teal-brand"
        />
        <span className="text-xs text-stone-500 leading-relaxed">
          Akceptuję{' '}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }}
            className="text-teal-brand underline inline cursor-pointer hover:text-teal-light"
          >
            politykę prywatności
          </button>
          {' '}i regulamin zajęć.
        </span>
      </label>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={!agreed || !email || state.items.length === 0}
        className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
          agreed && email
            ? 'bg-teal-brand text-white shadow-lg hover:bg-teal-light active:scale-[0.98]'
            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
        }`}
      >
        <span>Przejdź do płatności</span>
        <span className="text-lg font-bold">{finalTotal.toFixed(0)} zł</span>
      </button>

      {/* Safe payment info */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 pt-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Bezpieczna płatność</span>
      </div>

      {/* Payment logos */}
      <div className="flex items-center justify-center gap-3">
        <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-sand/20 text-xs font-bold text-stone-600">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <circle cx="12" cy="12" r="2.5" fill="currentColor" />
          </svg>
          Blik
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-sand/20 text-xs font-bold text-blue-700">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="8" cy="12" r="5" fill="#1A1F71" />
            <circle cx="16" cy="12" r="5" fill="#F79F1A" />
          </svg>
          Visa
        </span>
        <span className="inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-sand/20 text-xs font-bold text-orange-600">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="5" fill="#EB001B" />
            <circle cx="16" cy="12" r="5" fill="#F79F1A" />
          </svg>
          Mastercard
        </span>
      </div>

      {/* Privacy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-bounce-in max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-800">Polityka Prywatności</h3>
              <button
                onClick={() => setShowPrivacy(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-sand-light transition-colors"
              >
                <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
              {privacyText}
            </div>
            <button
              onClick={() => setShowPrivacy(false)}
              className="w-full mt-4 py-2.5 rounded-xl bg-teal-brand text-white font-medium text-sm hover:bg-teal-light transition-colors"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl px-8 py-10 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-brand/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-brand animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-stone-800">Przetwarzanie płatności...</p>
            <p className="text-xs text-stone-400 mt-1">Proszę czekać</p>
          </div>
        </div>
      )}
    </div>
  )
}
