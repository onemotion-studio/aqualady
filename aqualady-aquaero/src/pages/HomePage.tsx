import { Link } from 'react-router-dom'
import { useState } from 'react'
import heroImage from '../assets/hero_1.png'
import musclesIcon from '../assets/Muscles.png'
import heartIcon from '../assets/Heart.png'
import energyIcon from '../assets/Energy.png'
import moodIcon from '../assets/Mood.png'
import sleepIcon from '../assets/Sleep.png'
import muscles2Icon from '../assets/muscles-2.png'
import GallerySlider from '../components/GallerySlider'

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
    desc: 'Ustepuje zmeczenie, pojawia sie lekkość i chec do aktywnego zycia.',
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
    title: 'Regeneracja i relaks mięśni',
    desc: 'Ciepła woda uwalnia napięcie mięśniowe po treningu, co przyspiesza ich regenerację i relaksację.',
  },
]

const plans = [
  { id: 'pass8', title: '8 zajec', sub: '1 miesiac', price: '299', desc: 'Dla osob, ktore dopiero zaczynaja swoja przygode z akwaaerobika.', popular: false },
  { id: 'pass12', title: '12 zajec', sub: '1,5 miesiaca', price: '399', desc: 'Najpopularniejszy wybor - optymalna liczba zajec dla regularnych cwiczen.', popular: true },
  { id: 'passUnlimited', title: 'Bezlimit', sub: '1 miesiac', price: '549', desc: 'Nieograniczony dostep do wszystkich zajec. Dla prawdziwych entuzjastek!', popular: false },
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
  return (
    <div className="space-y-0 pb-8">
      {/* HERO SECTION */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <section className="relative w-full overflow-hidden min-h-[320px] sm:min-h-[40vh] lg:min-h-[50vh]">
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-[#fdfbf7]" />
          <div className="relative z-10 flex flex-col justify-between px-5 sm:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-8 lg:pt-10 min-h-[320px] sm:min-h-[40vh] lg:min-h-[50vh]">
            {/* WhatsApp Buttons — наверху слева */}
            <div className="flex flex-col gap-3 sm:gap-4 self-start">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 sm:py-5 rounded-2xl bg-[#094348] text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-black/10 group"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-base sm:text-lg font-bold leading-tight">Grupa informacyjna</span>
                  <span className="text-sm sm:text-base text-white/70 leading-tight">Sprawdz szczegoly</span>
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

            {/* Title — внизу секции */}
            <div className="max-w-3xl">
              <h1 className="space-y-1 sm:space-y-2">
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light leading-[1.2] tracking-tight text-[#094348] drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  Studio aqua aerobiku "Aqua Lady"
                </span>
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light italic leading-[1.2] tracking-tight text-[#8B6F45] drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]"
                  style={{ fontFamily: "'Merriweather', serif" }}
                >
                  zaprasza na zajecia prozdrowotne
                </span>
              </h1>
            </div>
          </div>
        </section>
      </div>

      {/* Korzysci zdrowotne */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <section>
          <div className="mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg lg:text-xl font-extralight text-[#65AFB3] uppercase text-left">Korzyści zdrowotne dla seniorów</h2>
          </div>
          <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden flex items-center justify-center">
                  <img src={b.icon} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-sm sm:text-base font-semibold text-stone-800 mb-0.5">{b.title}</h3>
                  <p className="text-sm sm:text-base text-stone-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
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

      {/* Opis */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <section className="rounded-2xl p-5 sm:p-6 lg:p-8">
          <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed mb-4">
            Program jest skierowany do osob starszych i ma na celu bezpieczna poprawe zdrowia, utrzymanie aktywnosci fizycznej oraz dobrego samopoczucia.
          </p>
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-stone-700 mb-3">
            Glowne efekty terapeutyczne:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {[
              'Wzmocnienie ukladu ruchu',
              'Ksztaltowanie prawidlowej postawy ciala',
              'Redukcja masy ciala',
              'Zwiekszenie elastycznosci skory i miesni',
              'Hartowanie organizmu',
              'Poprawa krazenia krwi w calym ciele',
              'Likwidacja zastojow w nogach',
              'Redukcja stresu, poprawa snu i humoru',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm sm:text-base text-stone-600">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="h-16 sm:h-20" />
    </div>
  )
}