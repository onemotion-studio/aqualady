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
const gallerySlides = Object.entries(galleryImports).map(([path, mod]) => {
  const src = (mod as { default: string }).default
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const isVideo = ['mp4', 'webm'].includes(ext)
  return { type: isVideo ? 'video' as const : 'image' as const, src }
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
            <h1 style={{ textShadow: "1px 1px 0 #2b8687" }} className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg max-w-lg">
              Akwaaerobika<br />dla kobiet 60+
            </h1>
            <p style={{ textShadow: "1px 1px 0 #2b8687" }} className="text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed mb-4 max-w-[320px] sm:max-w-md drop-shadow-lg">
              Popraw kondycje, wzmocnij stawy i znajdz nowe przyjaciolki w przyjaznej, kobiecej atmosferze.
            </p>
          </div>
        </section>
      </div>

      {/* Rest of content with padding */}
      <div className="px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-8 lg:space-y-10 mt-6 sm:mt-8 lg:mt-10">

        {/* WHY EXERCISE - адаптивная сетка */}
        <section>
          <div className="mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800 text-center">Dlaczego jest to korzystne wlasnie teraz</h2>
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
                  <p className="text-[12px] sm:text-sm text-stone-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

                {/* ABOUT + GALLERY — на десктопе в одну строку */}
                <div className="lg:flex lg:gap-6 lg:items-stretch">
                  <section className="bg-gradient-to-br from-teal-brand/5 to-white rounded-2xl p-5 sm:p-6 lg:p-8 border border-sand/10 lg:w-[40%] shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-teal-brand rounded-full" />
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-stone-800">O nas</h2>
                    </div>
                    <p className="text-[13px] sm:text-sm lg:text-base text-stone-600 leading-relaxed max-w-2xl">
                      Aqualady Aquaero zaprasza seniorow na zdrowe, poranne zajecia w Warszawie. Nasza akwaaerobika poprawia sprawnosc stawow i dodaje energii bez nadmiernego obciazenia organizmu. To idealny sposob na zachowanie aktywnosci fizycznej oraz spotkanie nowych osob w przyjaznej atmosferze. Wybierz swoj basen, zarezerwuj dogodne terminy w kalendarzu i dolacz do naszej spolecznosci juz dzis. Poczuj sie mlodziej z nami!
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
