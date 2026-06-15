import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx'

const navLinkClass = (active) =>
  active
    ? 'text-white font-label-caps border-b border-white'
    : 'text-white/70 hover:text-white font-label-caps transition-colors'

export default function HeaderNav({ activePage } = {}) {
  const { language, setLanguage, ui, languageLabel } = useLanguage()
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  return (
    <header className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="pointer-events-auto bg-primary/95 backdrop-blur-md px-4 sm:px-8 md:px-10 py-3 rounded-full flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-12 text-white soft-shadow border border-white/10 w-full max-w-fit">
        <Link to="/" className="font-headline-md text-xl sm:text-2xl tracking-tighter text-white">
          travelah
        </Link>
        <nav className="flex items-center gap-3 sm:gap-5 md:gap-8 border-l border-white/20 pl-3 sm:pl-5 md:pl-8">
          <Link to="/explore" className={navLinkClass(activePage === 'explore')}>
            {ui.explore}
          </Link>
          <Link to="/trips" className={navLinkClass(activePage === 'trips')}>
            {ui.myTrips}
          </Link>
          <Link to="/plan" className={navLinkClass(activePage === 'plan')}>
            {ui.plan}
          </Link>
        </nav>
        <div className="flex items-center gap-6 border-l border-white/20 pl-8">
          <details className="relative font-label-caps text-white/70 hover:text-white transition-colors [&_summary]:list-none [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer">{languageLabel}</summary>
            <div className="absolute right-0 top-full pt-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-[10px] shadow-2xl py-2 w-40 text-on-surface overflow-hidden">
                {Object.values(LANGUAGES).map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`block w-full text-left px-4 py-2 hover:bg-surface-container transition-colors font-body-md ${
                      language === lang.code ? 'bg-surface-container text-primary font-medium' : ''
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </details>
          {isAuthenticated ? (
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-primary transition-all"
              aria-label="Profile"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </Link>
          ) : (
            <Link
              to="/login"
              state={{ background: location }}
              className="font-label-caps text-[11px] tracking-widest uppercase text-primary bg-white hover:bg-white/90 transition-colors rounded-full px-5 py-2 whitespace-nowrap"
            >
              Get started
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
