import { Link } from 'react-router-dom'
import heroImage from '../assets/hero_1.png'

const benefits = [
  { icon: '🫀', title: 'Stawy bez bólu', desc: 'Woda odciąża stawy, ułatwia ruch i zmniejsza ból już po pierwszych zajęciach.' },
  { icon: '💪', title: 'Serce jak dzwon', desc: 'Poprawia wydolność układu krążenia bez obciążania organizmu.' },
  { icon: '⚡', title: 'Energia na cały dzień', desc: 'Poranna dawka endorfin i energii, która napędza Cię do działania.' },
  { icon: '😴', title: 'Zdrowy sen', desc: 'Regularne ćwiczenia głęboko poprawiają jakość snu i regenerację.' },
  { icon: '👥', title: 'Nowi przyjaciele', desc: 'Spotkania w grupie to radość, wsparcie i wspólna motywacja w miłej atmosferze.' },
  { icon: '🌟', title: 'Lepsze samopoczucie', desc: 'Ruch w wodzie dodaje lekkości, poprawia nastrój i redukuje stres.' },
]

const plans = [
  { id: 'pass8', title: '8 zajęć', sub: '1 miesiąc', price: '299', desc: 'Dla osób, które dopiero zaczynają swoją przygodę z akwaaerobiką.', popular: false },
  { id: 'pass12', title: '12 zajęć', sub: '1,5 miesiąca', price: '399', desc: 'Najpopularniejszy wybór — optymalna liczba zajęć dla regularnych ćwiczeń.', popular: true },
  { id: 'passUnlimited', title: 'Bezlimit', sub: '1 miesiąc', price: '549', desc: 'Nieograniczony dostęp do wszystkich zajęć. Dla prawdziwych entuzjastek!', popular: false },
]

const galleryImages = [
  { id: 1, alt: 'Zajęcia akwaaerobiki w basenie' },
  { id: 2, alt: 'Seniorzy ćwiczą w wodzie' },
  { id: 3, alt: 'Instruktorka prowadzi zajęcia' },
  { id: 4, alt: 'Grupa seniorów w basenie' },
  { id: 5, alt: 'Ćwiczenia z przyrządami' },
  { id: 6, alt: 'Uśmiechnięci uczestnicy' },
  { id: 7, alt: 'Zajęcia w Basenie Fala' },
]

export default function HomePage() {
  return (
    <div className="space-y-0 pb-8">
      {/* HERO SECTION — full width (negative margin to break out of px-4) */}
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
            <div className="inline-block bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3 w-fit tracking-wider border border-white/30">
              NOWOŚĆ!
            </div>
            <h1 className="text-2xl font-extrabold text-white leading-tight mb-2 drop-shadow-sm">
              Akwaaerobika<br />dla kobiet 60+
            </h1>
            <p className="text-sm text-white/90 leading-relaxed mb-4 max-w-[280px] drop-shadow-sm">
              Popraw kondycję, wzmocnij stawy i znajdź nowe przyjaciółki w przyjaznej, kobiecej atmosferze.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[12px] text-white/80">4.9 (128 opinii)</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-white/80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>2 baseny w Warszawie</span>
            </div>
          </div>
        </section>
      </div>

      {/* Rest of content with padding */}
      <div className="px-4 space-y-7 mt-6">

        {/* WHY EXERCISE */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-teal-brand/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-teal-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-stone-800">Dlaczego warto ćwiczyć w tym wieku?</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-sand/10 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-teal-brand/10 flex items-center justify-center text-teal-brand mb-2.5 text-lg">
                  {b.icon}
                </div>
                <h3 className="text-sm font-semibold text-stone-800 mb-0.5">{b.title}</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed">{b.desc}</p>
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
            Aqualady Aquaero zaprasza seniorów na zdrowe, poranne zajęcia w Warszawie. Nasza akwaaerobika poprawia sprawność stawów i dodaje energii bez nadmiernego obciążenia organizmu. To idealny sposób na zachowanie aktywności fizycznej oraz spotkanie nowych osób w przyjaznej atmosferze. Wybierz swój basen, zarezerwuj dogodne terminy w kalendarzu i dołącz do naszej społeczności już dziś. Poczuj się młodziej z nami!
          </p>
        </section>

        {/* PRICING */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-teal-brand rounded-full" />
            <h2 className="text-base font-bold text-stone-800">Wybierz swój plan</h2>
          </div>
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 transition-all hover:shadow-md ${
                  plan.popular ? 'border-teal-brand' : 'border-sand/15 hover:border-teal-brand/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-800">{plan.title}</h3>
                      {plan.popular && (
                        <span className="text-[9px] bg-teal-brand text-white font-bold px-2 py-0.5 rounded-full">POPULARNE</span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400">{plan.sub}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-teal-brand">{plan.price}</span>
                    <span className="text-xs text-stone-400 ml-0.5">zł</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mt-1.5 mb-3">{plan.desc}</p>
                <Link
                  to="/booking"
                  className="block w-full py-2.5 rounded-xl bg-teal-brand text-white text-sm font-bold text-center hover:bg-teal-light active:scale-[0.98] transition-all shadow-sm"
                >
                  Kupić
                </Link>
              </div>
            ))}
          </div>
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
                className={`bg-sand-light rounded-xl overflow-hidden aspect-square flex items-center justify-center text-stone-400 text-[10px] text-center p-1 border border-sand/20 ${
                  img.id === 1 ? 'col-span-2 row-span-2' : ''
                }`}
              >
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <svg className="w-6 h-6 mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Zdjęcie {img.id}</span>
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
                    <span>Zdjęcie {img.id}</span>
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