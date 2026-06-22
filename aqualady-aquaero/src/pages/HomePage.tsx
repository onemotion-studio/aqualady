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
      {/* HERO SECTION - full width (negative margin to break out of px-4) */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <section className="relative w-full overflow-hidden min-h-[320px] sm:min-h-[50vh] lg:min-h-[520px]">
          {/* Background image */}
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-5 sm:px-8 lg:px-12 py-10 sm:py-16 lg:py-20 min-h-[320px] sm:min-h-[50vh] lg:min-h-[520px]">
                                                                                                                                                                                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2B878A] leading-tight mb-3 max-w-xl drop-shadow-[0_2px_2px_rgba(255,255,255,1)]">
              Studio aqua aerobiku<br />„Aqua Lady” zaprasza<br />na zajęcia prozdrowotne
            </h1>
                                                <p className="text-base sm:text-lg lg:text-xl text-stone-800 leading-relaxed max-w-[360px] sm:max-w-lg drop-shadow-[0_1px_1px_rgba(255,255,255,1)]">
              Popraw kondycje, wzmocnij stawy<br className="sm:hidden" />
              i znajdz nowe przyjaciolki w przyjaznej, <br className="sm:hidden" />
              kobiecej atmosferze
            </p>
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 mt-4 sm:mt-5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-teal-brand text-white font-bold text-sm sm:text-base shadow-md hover:bg-teal-light active:scale-[0.97] transition-all self-start"
            >
              Grafik i Cennik
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>

            {/* Блок-описание сразу под hero */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
        <section className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-sand/10 shadow-sm">
          <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed mb-4">
            Opracowaliśmy program z uwzględnieniem zmian organizmu związanych z wiekiem. Program jest skierowany do osób starszych i ma na celu bezpieczną poprawę zdrowia, utrzymanie aktywności fizycznej oraz dobrego samopoczucia.
          </p>
          <p className="text-sm sm:text-base lg:text-lg font-semibold text-stone-700 mb-3">
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

      {/* Rest of content with padding */}
      <div className="px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-8 lg:space-y-10 mt-7 sm:mt-8 lg:mt-10">

        {/* WHY EXERCISE - адаптивная сетка */}
        <section>
          <div className="mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800 text-center">Korzyści zdrowotne dla seniorów</h2>
            </div>
          <div className="space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={b.icon}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-sm sm:text-base font-semibold text-stone-800 mb-0.5">{b.title}</h3>
                  <p className="text-sm sm:text-base text-stone-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
                    </div>
        </section>

                {/* INFO ORGANIZACYJNE */}
        <section className="bg-gradient-to-br from-teal-brand/5 to-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-sand/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-teal-brand rounded-full" />
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800">Informacje organizacyjne</h2>
          </div>
          <div className="space-y-3 text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed">
            <p>
              <span className="font-semibold text-stone-800">Czas trwania:</span> Zajęcia trwają 45 minut.
            </p>
            <p>
              <span className="font-semibold text-stone-800">Poziom trudności:</span> Dostosowany do możliwości seniorów – ćwiczymy we własnym tempie.
            </p>
                        <p>
              <span className="font-semibold text-stone-800">Głębokość wody:</span> Ćwiczenia odbywają się na bezpiecznej głębokości (woda do klatki piersiowej), umiejętność pływania nie jest wymagana!
            </p>
            <p>
              <span className="font-semibold text-stone-800">Komfort:</span> Zajęcia odbywają się w komfortowym tempie, bez przeciążeń. Umiejętność pływania nie jest wymagana.
            </p>
          </div>
        </section>

                <div className="lg:flex lg:gap-6 lg:items-stretch">
                  <section className="bg-gradient-to-br from-teal-brand/5 to-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-sand/10 lg:w-[40%] shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-teal-brand rounded-full" />
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800">O nas</h2>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg text-stone-600 leading-relaxed max-w-2xl">
                      Zapraszamy na wyjątkowe zajęcia aqua aerobiku, stworzone specjalnie z myślą o seniorach! Ćwiczenia odbywają się bez obciążania stawów i kręgosłupa, a wszystko to pod okiem certyfikowanych instruktorów.
                    </p>
                  </section>

                  <section className="lg:flex-1">
                    <GallerySlider slides={gallerySlides} className="w-full" />
                  </section>
                </div>

      </div>

      {/* Spacer */}
      <div className="h-16 sm:h-20" />
    </div>
  )
}
