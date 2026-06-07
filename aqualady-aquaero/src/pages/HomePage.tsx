import { Link } from 'react-router-dom'
import heroImage from '../assets/hero_1.png'
import musclesIcon from '../assets/Muscles.png'
import heartIcon from '../assets/Heart.png'
import energyIcon from '../assets/Energy.png'
import moodIcon from '../assets/Mood.png'
import sleepIcon from '../assets/Sleep.png'

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

export default function HomePage() {
  return (
    <div className="space-y-0 pb-8">
      {/* HERO SECTION - full width (negative margin to break out of px-4) */}
      <div className="-mx-4">
        <section className="relative w-full overflow-hidden" style={{ minHeight: 320 }}>
          {/* Background image */}
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C8889]/80 via-[#2C8889]/50 to-transparent" />
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-5 py-10" style={{ minHeight: 320 }}>
            <h1 className="text-2xl font-extrabold text-white leading-tight mb-2 drop-shadow-sm">
              Akwaaerobika<br />dla kobiet 60+
            </h1>
            <p className="text-sm text-white/90 leading-relaxed mb-4 max-w-[280px] drop-shadow-sm">
              Popraw kondycje, wzmocnij stawy i znajdz nowe przyjaciolki w przyjaznej, kobiecej atmosferze.
            </p>
          </div>
        </section>
      </div>

      {/* Rest of content with padding */}
      <div className="px-4 space-y-7 mt-6">

        {/* WHY EXERCISE */}
        <section>
          <div className="mb-5">
              <h2 className="text-base font-bold text-stone-800 text-center">Dlaczego jest to korzystne wlasnie teraz</h2>
            </div>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-sand/10 hover:shadow-md transition-shadow"
              >
                <div className="w-16 h-16 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src={b.icon}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-sm font-semibold text-stone-800 mb-0.5">{b.title}</h3>
                  <p className="text-[12px] text-stone-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section className="bg-gradient-to-br from-teal-brand/5 to-white rounded-2xl p-5 border border-sand/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-teal-brand rounded-full" />
            <h2 className="text-base font-bold text-stone-800">O nas</h2>
          </div>
          <p className="text-[13px] text-stone-600 leading-relaxed">
            Aqualady Aquaero zaprasza seniorow na zdrowe, poranne zajecia w Warszawie. Nasza akwaaerobika poprawia sprawnosc stawow i dodaje energii bez nadmiernego obciazenia organizmu. To idealny sposob na zachowanie aktywnosci fizycznej oraz spotkanie nowych osob w przyjaznej atmosferze. Wybierz swoj basen, zarezerwuj dogodne terminy w kalendarzu i dolacz do naszej spolecznosci juz dzis. Poczuj sie mlodziej z nami!
          </p>
        </section>

        {/* GALLERY */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-teal-brand rounded-full" />
            <h2 className="text-base font-bold text-stone-800">Galeria</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {galleryImages.slice(0, 5).map((img) => (
              <div
                key={img.id}
                className={'bg-sand-light rounded-xl overflow-hidden aspect-square flex items-center justify-center text-stone-400 text-[10px] text-center p-1 border border-sand/20 ' + (img.id === 1 ? 'col-span-2 row-span-2' : '')}
              >
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Zdjecie {img.id}</span>
                </div>
              </div>
            ))}
          </div>
          {galleryImages.length > 5 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {galleryImages.slice(5).map((img) => (
                <div
                  key={img.id}
                  className="bg-sand-light rounded-xl overflow-hidden aspect-square flex items-center justify-center text-stone-400 text-[10px] text-center p-1 border border-sand/20"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Zdjecie {img.id}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Spacer */}
      <div className="h-16" />
    </div>
  )
}
