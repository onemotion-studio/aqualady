import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import heroImage from '../assets/hero_1.png'
import musclesIcon from '../assets/Muscles.png'
import heartIcon from '../assets/Heart.png'
import energyIcon from '../assets/Energy.png'
import moodIcon from '../assets/Mood.png'
import sleepIcon from '../assets/Sleep.png'
import muscles2Icon from '../assets/muscles-2.png'
import GallerySlider from '../components/GallerySlider'
import { loadSubscriptionsFromServer, loadTemplatesFromServer, loadPoolNames } from '../lib/supabase'
import { MONTHS_PL } from '../config'

// Auto-import all gallery media files
const galleryImports = import.meta.glob('/src/assets/gallery/*.{png,jpg,jpeg,gif,webp,mp4,webm}', { eager: true, query: '?url' })

const benefits = [
  {
    icon: musclesIcon,
    title: 'Bez obciazania stawow',
    desc: 'Woda podtrzymuje cialo i zmniejsza obciazenie kolan, plecow i kregoslupa.',
  },
  {
    icon: heartIcon,
    title: 'Wzmacnia serce i naczynia krwionosne',
    desc: 'Regularne cwiczenia poprawiaja krazenie, cisnienie i ogolne samopoczucie.',
  },
  {
    icon: energyIcon,
    title: 'Wiecej energii i witalnosci',
    desc: 'Ustepuje zmeczenie, pojawia sie lekkoЕ›Д‡ i chec do aktywnego zycia.',
  },
  {
    icon: moodIcon,
    title: 'Dobry nastroj i kontakty towarzyskie',
    desc: 'Ciepla atmosfera, mile rozmowy i wsparcie osob o podobnych zainteresowaniach.',
  },
    {
    icon: sleepIcon,
    title: 'Lepszy sen i odpoczynek',
    desc: 'Po zajeciach cialo sie relaksuje, a sen staje sie glebszy i spokojniejszy.',
  },
  {
    icon: muscles2Icon,
    title: 'Regeneracja i relaks miД™Е›ni',
    desc: 'CiepЕ‚a woda uwalnia napiД™cie miД™Е›niowe po treningu, co przyspiesza ich regeneracjД™ i relaksacjД™.',
  },
]

const galleryImages = [
  { id: 1, alt: 'Zajecia akwaaerobiki w basenie' },
  { id: 2, alt: 'Seniorzy cwicza w wodzie' },
  { id: 3, alt: 'Instruktorka prowadzi zajecia' },
  { id: 4, alt: 'Grupa seniorow w basenie' },
  { id: 5, alt: 'Cwiczenia z przyrzadami' },
  { id: 6, alt: 'Usmiechnieci uczestnicy' },
  { id: 7, alt: 'Zajecia w Basenie Fala' },
]

function slotLabel(value: string): string {
  const m = value.match(/slot_(\d{2})(\d{2})/)
  return m ? `${m[1]}:${m[2]}` : value
}

// Build gallery slides from auto-imported files
const gallerySlides = Object.entries(galleryImports)
  .map(([path, mod]) => {
    const src = (mod as { default: string }).default
    const ext = path.split('.').pop()?.toLowerCase() || ''
    const isVideo = ['mp4', 'webm'].includes(ext)
    return { type: isVideo ? 'video' as const : 'image' as const, src }
  })
  .sort((a, b) => {
    // Videos first, then images
    if (a.type === 'video' && b.type !== 'video') return -1
    if (a.type !== 'video' && b.type === 'video') return 1
    return 0
  })

export default function HomePage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [poolNames, setPoolNames] = useState<Record<string, string>>({})

  useEffect(() => {
    Promise.all([
      loadSubscriptionsFromServer(),
      loadTemplatesFromServer(),
      loadPoolNames(),
    ]).then(([subs, tmpls, pools]) => {
      const now = new Date()
      const active = subs.filter((s: any) => s.is_published && (!s.expires_at || new Date(s.expires_at) > now))
      setSubscriptions(active)
      setTemplates(tmpls)
      setPoolNames(pools)
    }).catch(() => {})
  }, [])

  const grouped = subscriptions.reduce((acc: Record<string, any[]>, sub: any) => {
    const key = sub.template_id
    if (!acc[key]) acc[key] = []
    acc[key].push(sub)
    return acc
  }, {})

  const DAY_SHORT = ['pon', 'wt', 'śr', 'czw', 'pt', 'sob', 'niedz']
  return (
    <div className="space-y-0 pb-8">
      {/* HERO SECTION */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <section className="relative w-full overflow-hidden min-h-[352px] sm:min-h-[44vh] lg:min-h-[calc(55vh+80px)]">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#fdfbf7]" />
          <div className="relative z-10 flex flex-col justify-between px-5 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-8 lg:pt-10 min-h-[352px] sm:min-h-[44vh] lg:min-h-[calc(55vh+80px)]">
            {/* WhatsApp Buttons вЂ” наверху СЃР»РµРІР° */}
            <div className="flex flex-col gap-3 sm:gap-4 self-start">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl bg-[#094348] text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-black/10 group"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-base sm:text-lg font-bold leading-tight">Grupa informacyjna</span>
                  <span className="text-sm sm:text-base text-white/70 leading-tight">Sprawdź szczegóły</span>
                </div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl bg-[#65AFB3] text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-black/10 group"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-base sm:text-lg font-bold leading-tight">Masz pytania?</span>
                  <span className="text-sm sm:text-base text-white/80 leading-tight">Napisz do nas</span>
                </div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white/60 group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Title вЂ” внизу СЃРµРєС†РёРё */}
            <div className="max-w-3xl">
              <h1 className="space-y-1 sm:space-y-2">
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light leading-[1.2] tracking-tight text-[#094348] drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  <span className="block sm:inline">Studio aqua aerobiku </span><span className="block sm:inline">"Aqua Lady"</span>
                </span>
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light italic leading-[1.2] tracking-tight text-[#8B6F45] drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  zaprasza na zajęcia prozdrowotne
                </span>
              </h1>
            </div>
          </div>
        </section>
      </div>

      {/* Opis */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <section className="rounded-2xl p-5 sm:p-6 lg:p-8">
          <p className="text-lg sm:text-xl lg:text-2xl text-stone-600 leading-relaxed mb-4">
            Program jest skierowany do osób starszych i ma na celu bezpieczną poprawę zdrowia, utrzymanie aktywności fizycznej oraz dobrego samopoczucia.
          </p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-stone-700 mb-3">
            Główne efekty terapeutyczne:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {[
              'Wzmocnienie układu ruchu',
              'Kształtowanie prawidłowej postawy ciała',
              'Redukcja masy ciała',
              'Zwiększenie elastyczności skóry i mięśni',
              'Hartowanie organizmu',
              'Poprawa krążenia krwi w całym ciele',
              'Likwidacja zastojów w nogach',
              'Redukcja stresu, poprawa snu i humoru',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-lg sm:text-xl text-stone-600">
                <svg className="w-6 h-6 sm:w-7 sm:h-5 shrink-0 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl text-stone-600 leading-relaxed mt-4">
            Zajęcia odbywają się w komfortowym tempie, bez przeciążeń. Umiejętność pływania nie jest wymagana.
          </p>
        </section>
      </div>

      {/* Galeria */}
      <section className="mt-6 sm:mt-8 lg:mt-10">
        <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5">
          <h2 className="text-base sm:text-lg lg:text-xl font-extralight text-[#65AFB3] uppercase text-left">Zobaczcie, jak to działa</h2>
        </div>
        <div className="px-4 sm:px-6 lg:px-8">
          <GallerySlider slides={gallerySlides} className="w-full" />
        </div>
      </section>

      {/* Cennik — abonamenty miesięczne */}
      {Object.keys(grouped).length > 0 && (
        <section className="mt-6 sm:mt-8 lg:mt-10">
          <div className="px-4 sm:px-6 lg:px-8 mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg lg:text-xl font-extralight text-[#65AFB3] uppercase text-left">Abonamenty miesięczne</h2>
          </div>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(grouped).map(([templateId, subs]) => {
                const tmpl = templates.find((t: any) => t.id === templateId)
                if (!tmpl) return null

                const totalSlots = (subs as any[]).reduce((s: number, sub: any) => s + (sub.dates?.length || 0), 0)

                return (
                  <div key={templateId} className="bg-white rounded-2xl p-5 shadow-sm border border-sand/20 hover:shadow-md transition-all flex flex-col relative">
                    {tmpl.tag && (
                      <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm border border-sand/20 whitespace-nowrap text-stone-500 z-10">
                        {tmpl.tag}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-stone-800">{tmpl.name}</h3>
                        <span className="text-lg font-bold text-teal-brand">{tmpl.price} zł</span>
                      </div>
                      <p className="text-xs text-stone-400 mb-1">
                        {tmpl.total_classes} zajęć · {poolNames[tmpl.pool_id] || tmpl.pool_id}
                      </p>
                      {tmpl.days_of_week.length > 0 && (
                        <p className="text-[10px] text-stone-400 mb-1">Dni: {tmpl.days_of_week.map((d: number) => DAY_SHORT[d]).join(', ')}</p>
                      )}
                      {tmpl.time_slots.length > 0 && (
                        <p className="text-[10px] text-stone-400 mb-1">Godziny: {tmpl.time_slots.map(slotLabel).join(', ')}</p>
                      )}
                      <p className="text-[10px] text-stone-400">Dostępne miesiące: {(subs as any[]).map((s: any) => `${MONTHS_PL[s.month - 1]} ${s.year}`).join(', ')}</p>
                    </div>
                    <Link
                      to="/subscriptions"
                      className="mt-4 w-full py-2.5 rounded-xl bg-teal-brand text-white text-xs font-bold text-center hover:bg-teal-light active:scale-[0.98] transition-all block"
                    >
                      Wybierz termin
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Social media — pod galeria */}
        <section className="mt-6 sm:mt-8 lg:mt-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 py-6 sm:py-8">
            <p className="text-sm sm:text-base text-stone-500 font-medium">Obserwuj nas:</p>
            <div className="flex items-center justify-center gap-5">
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity shadow-md" aria-label="Facebook">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center hover:opacity-80 transition-opacity shadow-md" aria-label="Instagram">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-80 transition-opacity shadow-md" aria-label="YouTube">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        </section>

        <div className="h-16 sm:h-20" />
    </div>
  )
}
