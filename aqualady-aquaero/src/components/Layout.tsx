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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sand/30 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center no-underline shrink-0">
          <img
            src={logoSrc}
            alt="Aqualady Aquaero"
            className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
          />
        </Link>

                                                                                                                                <nav className="flex items-center gap-2 sm:gap-3">
          {/* Contact popup trigger — только на мобилках */}
          <button
            onClick={() => setShowContactPopup(true)}
            className="sm:hidden p-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-700 transition-colors"
            aria-label="Kontakt"
          >
            <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>

          {/* WhatsApp — Aktualności i wiadomości — скрываем на мобилках */}
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-700 text-sm sm:text-base font-medium transition-colors"
            aria-label="WhatsApp Aktualności"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
                        <span>Grupa informacyjna</span>
          </a>

          {/* WhatsApp — Masz pytania? Chętnie odpowiemy! — скрываем на мобилках */}
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500/10 hover:bg-green-500/20 text-green-700 text-sm sm:text-base font-medium transition-colors"
            aria-label="WhatsApp numer kontaktowy"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
                        <span>Masz pytania? Chętnie odpowiemy!</span>
                        </a>

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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-brand/10 hover:bg-teal-brand/20 text-teal-brand text-xs sm:text-sm font-medium transition-colors"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-brand/10 hover:bg-teal-brand/20 text-teal-brand text-xs sm:text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Zaloguj się</span>
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
                className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-700 font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-6 h-6 text-[#25D366] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div className="flex flex-col">
                  <span className="text-sm sm:text-base font-semibold">Masz pytania? Chętnie odpowiemy!</span>
                  <span className="text-xs text-green-600">Napisz do nas</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}

      <main className={`flex-1 px-4 sm:px-6 lg:px-8 ${isHome ? "pb-32 sm:pb-36" : "pb-24 sm:pb-28"}`}>
        <Outlet />
      </main>

            {/* Sticky CTA (only on home page) — fixed снизу, но футер его перекрывает */}
            {isHome && (
              <div className="sticky-cta">
                <Link
                  to="/booking"
                  className="flex items-center justify-center gap-2 w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-teal-brand text-white font-bold text-base sm:text-lg shadow-lg hover:bg-teal-light active:scale-[0.98] transition-all"
                >
                  Grafik i Cennik
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Footer — z-index выше, чем у CTA, чтобы перекрывать его при скролле */}
            <footer className="relative z-90 bg-white border-t border-sand/30 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 text-center">
        <div className="flex items-center justify-center gap-5 mb-3">
          <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Facebook">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Instagram">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
          <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="YouTube">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
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
