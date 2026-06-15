import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { LANGUAGES, useLanguage } from '../../context/LanguageContext.jsx'

export default function HomeTopNav({ activePage } = {}) {
  const { language, setLanguage, ui, languageLabel } = useLanguage()
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [langOpen, setLangOpen] = useState(false)

  return (
    <nav className="home-topbar">
      <Link to="/" className="nav-logo">
        travelah
      </Link>

      <ul className="nav-links">
        <li>
          <Link to="/explore" className={activePage === 'explore' ? 'active' : ''}>
            {ui.explore}
          </Link>
        </li>
        <li>
          <Link to="/plan" className={activePage === 'plan' ? 'active' : ''}>
            {ui.plan}
          </Link>
        </li>
        <li>
          <Link to="/trips" className={activePage === 'trips' ? 'active' : ''}>
            {ui.myTrips}
          </Link>
        </li>
        <li>
          <a href="#explore">Heritage</a>
        </li>
      </ul>

      <div className="nav-cta">
        <div className="nav-lang-wrap">
          <button
            type="button"
            className="nav-lang"
            onClick={() => setLangOpen((open) => !open)}
            aria-expanded={langOpen}
          >
            {languageLabel}
          </button>
          {langOpen && (
            <div className="nav-lang-menu">
              {Object.values(LANGUAGES).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={language === lang.code ? 'active' : ''}
                  onClick={() => {
                    setLanguage(lang.code)
                    setLangOpen(false)
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isAuthenticated ? (
          <Link to="/profile" className="btn-pill" aria-label="Profile">
            Profile
          </Link>
        ) : (
          <Link to="/login" state={{ background: location }} className="btn-pill">
            Get started
          </Link>
        )}
      </div>
    </nav>
  )
}
