import { Outlet, Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import logoSrc from '../assets/logo_full.png'
import { useState } from 'react'

export default function Layout() {
  const location = useLocation()
  const { state } = useCart()
  const { user } = useAuth()
  const cartCount = state.items.length
  const isHome = location.pathname === '/'
  const isAuthPage = location.pathname === '/auth'
  const [showContactPopup, setShowContactPopup] = useState(false)

  return (
    <div className="flex flex-col min-h-dvh">

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sand/30 px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center no-underline shrink-0">
          <img
            src={logoSrc}
            className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
          />
        </Link>

                                                                                                                                <nav className="flex items-center gap-2 sm:gap-3">
                    {/* Contact popup — hidden, buttons moved to hero */}

                                        {/* WhatsApp buttons hidden — now on homepage hero */}

                              <Link
            to="/cart"
            className="relative p-2 sm:p-2.5 rounded-full hover:bg-sand-light transition-colors"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 bg-red-accent text-white text-xs sm:text-sm font-bold rounded-full flex items-center justify-center shadow">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Login / Profile */}
          {user ? (
            <Link
              to="/profile"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7BE2F7] hover:bg-[#FFD878] text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline truncate max-w-[100px]">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </span>
            </Link>
          ) : !isAuthPage ? (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7BE2F7] hover:bg-[#FFD878] text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-lg px-3 hidden sm:inline">Zaloguj się</span>
            </Link>
          ) : null}
              </nav>
              </header>

      {/* Contact Popup — вынесен из header, чтобы быть по центру экрана */}
      {showContactPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowContactPopup(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 pb-8 shadow-2xl animate-bounce-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-800">Kontakt przez WhatsApp</h3>
              <button
                onClick={() => setShowContactPopup(false)}
                className="p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-700 font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-semibold">Grupa informacyjna</span>
                  <span className="text-xs text-green-600">Sprawdz szczegoly</span>
                </div>
              </a>
                            <a
                href="#"
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-gradient-secondary hover:brightness-110 text-white font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-semibold">Masz pytania? Chętnie odpowiemy!</span>
                  <span className="text-xs opacity-70">Napisz do nas</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

            <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${isHome ? "pb-0" : "pb-24 sm:pb-28"}`}>
              <Outlet />
            </main>

                  {/* Sticky CTA (only on home page) — sticky, но футер его не перекрывает */}
                  {isHome && (
                    <div className="sticky bottom-0 z-89 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-5 pointer-events-none">
                      <div className="max-w-2xl mx-auto pointer-events-auto">
                        <Link
                          to="/booking"
                                                                                                        className="flex items-center justify-center gap-3 sm:gap-4 w-full py-4 sm:py-5 px-3 sm:px-5 rounded-full bg-gradient-to-r from-[#94DEEE] to-[#29C5E2] text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                                                                                                        <div className="flex items-center justify-center gap-3 sm:gap-4">
                                                      <span className="text-xl sm:text-2xl font-light tracking-wide whitespace-nowrap">Grafik i Cennik</span>
                                                      <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                                      </svg>
                                                    </div>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
            <footer className="relative z-90 bg-white border-t border-sand/30 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 text-center">
        <p className="text-xs sm:text-sm text-stone-400 mb-0.5">
          &copy; 2026 Aqualady Aquaero
        </p>
        <p className="text-[11px] sm:text-xs text-stone-400">
          Akwaaerobika dla seniorów &middot; Warszawa
        </p>
      </footer>
    </div>
  )
}