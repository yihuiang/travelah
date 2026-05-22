import { Link } from 'react-router-dom'
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx'

const navLinkClass = (active) =>
  active
    ? 'text-white font-label-caps border-b border-white'
    : 'text-white/70 hover:text-white font-label-caps transition-colors'

export default function HeaderNav({ activePage } = {}) {
  const { language, setLanguage, ui, languageLabel } = useLanguage()

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto bg-primary/95 backdrop-blur-md px-10 py-3 rounded-full flex items-center gap-12 text-white soft-shadow border border-white/10 max-w-fit">
        <Link to="/" className="font-headline-md text-2xl tracking-tighter text-white">
          travelah
        </Link>
        <nav className="hidden md:flex items-center gap-8 border-l border-white/20 pl-8">
          <Link to="/explore" className={navLinkClass(activePage === 'explore')}>
            {ui.explore}
          </Link>
          <a className={navLinkClass(false)} href="/#trips">
            {ui.myTrips}
          </a>
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
          <Link
            to="/profile"
            className="w-9 h-9 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-primary transition-all"
            aria-label="Profile"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
