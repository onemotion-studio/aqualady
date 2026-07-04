import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadSubscriptionsFromServer, loadTemplatesFromServer, loadSubscriptionPurchases, type Subscription, type SubscriptionTemplate } from '../lib/supabase'
import { loadPoolsAsync, type PoolConfig } from '../config'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { MONTHS_PL } from '../config'

function slotLabel(value: string): string {
  const m = value.match(/slot_(\d{2})(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : value
}

export default function SubscriptionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { dispatch } = useCart()
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [allPools, setAllPools] = useState<Record<string, PoolConfig>>({})
  const [loading, setLoading] = useState(true)
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

  const handleAddToCart = (sub: Subscription) => {
    const tmpl = templates.find(t => t.id === sub.template_id)
    const name = tmpl?.name || 'Abonament'
    const id = 'sub_' + sub.id + '_' + Date.now() + '_' + Math.random()
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id,
        poolId: sub.pool_id,
        type: 'subscription',
        label: `${name} · ${MONTHS_PL[sub.month - 1]} ${sub.year}`,
        price: sub.price,
        quantity: 1,
        subscriptionId: sub.id,
        templateId: sub.template_id,
        month: sub.month,
        year: sub.year,
        dates: sub.dates,
      },
    })
    navigate('/cart')
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
      <p className="text-sm text-stone-400 mb-6">Wybierz abonament i dodaj do koszyka</p>

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
                          <button
                            onClick={() => handleAddToCart(sub)}
                            className="px-4 py-1.5 rounded-lg bg-teal-brand text-white text-[10px] font-bold hover:bg-teal-light active:scale-[0.97] transition-all"
                          >
                            Do koszyka
                          </button>
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

      <div className="mt-8 text-center">
        <p className="text-xs text-stone-400">Dodaj abonament do koszyka, aby dokonać zakupu.</p>
      </div>
    </div>
  )
}
