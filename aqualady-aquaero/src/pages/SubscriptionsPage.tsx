import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadSubscriptionsFromServer, loadTemplatesFromServer, addSubscriptionPurchase, loadSubscriptionPurchases, type Subscription, type SubscriptionTemplate } from '../lib/supabase'
import { loadPoolsAsync, type PoolConfig } from '../config'
import { useAuth } from '../context/AuthContext'
import { MONTHS_PL } from '../config'

function slotLabel(value: string): string {
  const m = value.match(/slot_(\d{2})(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : value
}

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [allPools, setAllPools] = useState<Record<string, PoolConfig>>({})
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [purchasingSubId, setPurchasingSubId] = useState<string | null>(null)
  const [purchaseMsg, setPurchaseMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    Promise.all([
      loadTemplatesFromServer(),
      loadSubscriptionsFromServer(),
      loadPoolsAsync(),
    ]).then(([tmpls, subs, pools]) => {
      setTemplates(tmpls)
      const now = new Date()
      const active = subs.filter((s: Subscription) => s.is_published && (!s.expires_at || new Date(s.expires_at) > now))
      setSubscriptions(active)
      setAllPools(pools)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!user) return
    loadSubscriptionPurchases().then(purchases => {
      const my = purchases.filter(p => p.user_email === user.email)
      setPurchasedIds(new Set(my.map(p => p.subscription_id)))
    }).catch(() => {})
  }, [user])

  const handlePurchase = async (sub: Subscription) => {
    if (!user) { navigate('/auth'); return }
    if (purchasedIds.has(sub.id)) {
      setPurchaseMsg({ ok: false, text: 'Już zakupiłaś ten abonament!' })
      return
    }
    setPurchasing(true)
    setPurchasingSubId(sub.id)
    setPurchaseMsg(null)
    const name = user.user_metadata?.full_name || user.email?.split('@')[0] || ''
    const id = await addSubscriptionPurchase({
      subscription_id: sub.id,
      user_email: user.email || '',
      user_name: name,
      promo_code: null,
      promo_discount: 0,
      final_price: sub.price,
    })
    if (id) {
      setPurchasedIds(prev => new Set([...prev, sub.id]))
      setPurchaseMsg({ ok: true, text: 'Abonament został zakupiony! Sprawdź go w swoim profilu.' })
    } else {
      setPurchaseMsg({ ok: false, text: 'Wystąpił błąd. Spróbuj ponownie później.' })
    }
    setPurchasing(false)
    setPurchasingSubId(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-brand/30 border-t-teal-brand rounded-full animate-spin" />
      </div>
    )
  }

  if (subscriptions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-16">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-800 mb-3">Abonamenty miesięczne</h1>
          <p className="text-sm text-stone-400">Aktualnie brak dostępnych abonamentów. Zapraszamy wkrótce!</p>
          <button
            onClick={() => navigate('/booking')}
            className="mt-6 px-6 py-3 rounded-xl bg-teal-brand text-white text-sm font-bold hover:bg-teal-light transition-all"
          >
            Rezerwuj pojedyncze zajęcia
          </button>
        </div>
      </div>
    )
  }

  const grouped = subscriptions.reduce((acc, sub) => {
    const key = sub.template_id
    if (!acc[key]) acc[key] = []
    acc[key].push(sub)
    return acc
  }, {} as Record<string, Subscription[]>)

  const DAY_SHORT = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz']

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">Abonamenty miesięczne</h1>
      <p className="text-sm text-stone-400 mb-6">Wybierz abonament, który najlepiej odpowiada Twoim potrzebom</p>

      {purchaseMsg && (
        <div className={`rounded-2xl p-4 mb-5 text-sm font-medium ${purchaseMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {purchaseMsg.text}
          {purchaseMsg.ok && (
            <button onClick={() => navigate('/profile')} className="ml-3 underline font-bold">Mój profil</button>
          )}
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(grouped).map(([templateId, subs]) => {
          const tmpl = templates.find(t => t.id === templateId)
          if (!tmpl) return null
          return (
            <div key={templateId} className="bg-white rounded-2xl p-5 shadow-sm border border-sand/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-base font-bold text-stone-800">{tmpl.name}</h2>
                  <p className="text-xs text-stone-400 mt-0.5">{tmpl.total_classes} zajęć · {allPools[tmpl.pool_id]?.name || tmpl.pool_id}</p>
                  {tmpl.days_of_week.length > 0 && (
                    <p className="text-[10px] text-stone-400 mt-0.5">Dni: {tmpl.days_of_week.map(d => DAY_SHORT[d]).join(', ')}</p>
                  )}
                  {tmpl.time_slots.length > 0 && (
                    <p className="text-[10px] text-stone-400 mt-0.5">Godziny: {tmpl.time_slots.map(slotLabel).join(', ')}</p>
                  )}
                </div>
                <span className="text-lg font-bold text-teal-brand shrink-0">{tmpl.price} zł</span>
              </div>

              <div className="space-y-2">
                {subs.map(sub => {
                  const alreadyOwned = purchasedIds.has(sub.id)
                  const datesCount = sub.dates?.length || 0
                  const datesStr = datesCount > 0
                    ? `${datesCount} termin${datesCount > 1 ? 'ów' : ''} · ${sub.dates[0].slice(8, 10)}.${sub.dates[0].slice(5, 7)} - ${sub.dates[datesCount - 1].slice(8, 10)}.${sub.dates[datesCount - 1].slice(5, 7)}.${sub.dates[datesCount - 1].slice(0, 4)}`
                    : ''

                  const isPurchasing = purchasing && purchasingSubId === sub.id

                  return (
                    <div key={sub.id} className={`rounded-xl p-3 border transition-all ${alreadyOwned ? 'bg-green-50 border-green-200' : 'bg-stone-50 border-stone-200 hover:border-teal-brand/30'}`}>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-stone-700">{MONTHS_PL[sub.month - 1]} {sub.year}</p>
                          {datesStr && <p className="text-[10px] text-stone-400 mt-0.5">{datesStr}</p>}
                          {sub.time_slot && (
                            <p className="text-[10px] text-stone-400">Godzina: {slotLabel(sub.time_slot)}</p>
                          )}
                        </div>
                        <div className="shrink-0 ml-3">
                          {alreadyOwned ? (
                            <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-[10px] font-bold">✓ Zakupiony</span>
                          ) : (
                            <button
                              onClick={() => handlePurchase(sub)}
                              disabled={isPurchasing || !user}
                              className="px-4 py-1.5 rounded-lg bg-teal-brand text-white text-[10px] font-bold hover:bg-teal-light active:scale-[0.97] transition-all disabled:opacity-50"
                            >
                              {isPurchasing ? (
                                <span className="flex items-center gap-1">
                                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ...
                                </span>
                              ) : 'Kup'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {!user && (
        <div className="mt-6 bg-stone-50 rounded-2xl p-4 text-center border border-stone-200">
          <p className="text-sm text-stone-500 mb-2">Zaloguj się, aby kupić abonament</p>
          <button onClick={() => navigate('/auth')} className="px-5 py-2 rounded-xl bg-teal-brand text-white text-sm font-bold hover:bg-teal-light transition-all">Zaloguj się</button>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-stone-400">Kupując abonament, akceptujesz regulamin. Zakupione abonamenty znajdziesz w swoim profilu.</p>
      </div>
    </div>
  )
}
