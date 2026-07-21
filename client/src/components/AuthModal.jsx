import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/auth-v2.css'

export const AUTH_HERO_IMAGE =
  'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80'

function formatCompactCount(count) {
  const n = Number(count) || 0
  if (n >= 1000) {
    const k = Math.round((n / 1000) * 10) / 10
    const text = Number.isInteger(k) ? String(k) : k.toFixed(1)
    return `${text}K+`
  }
  return String(n)
}

// Fallback from merged-data.json (~13,312 posts) when /api/stats is unavailable.
const DEFAULT_HERO_STATS = {
  posts: '13.3K+',
  states: '13',
  territories: '3',
}

export default function AuthModal({ children, variant = 'signin' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const background = location.state?.background
  const [heroStats, setHeroStats] = useState(DEFAULT_HERO_STATS)

  const closeModal = useCallback(() => {
    if (background) {
      navigate(background.pathname + (background.search || ''), { replace: true })
      return
    }
    navigate('/', { replace: true })
  }, [background, navigate])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeModal])

  useEffect(() => {
    let cancelled = false
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        setHeroStats({
          posts: formatCompactCount(data.postCount),
          states: String(data.stateCount ?? DEFAULT_HERO_STATS.states),
          territories: String(data.federalTerritoryCount ?? DEFAULT_HERO_STATS.territories),
        })
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="auth-v2" role="dialog" aria-modal="true">
      <div className="auth-overlay">
        <div className={`auth-card${variant === 'signup' ? ' auth-card--signup' : ''}`}>
          <button type="button" className="btn-close" onClick={closeModal} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              close
            </span>
          </button>

          <div className="auth-form-panel">
            <div className="auth-form-inner">{children}</div>
          </div>

          <div className="auth-hero-panel">
            <img src={AUTH_HERO_IMAGE} alt="George Town, Penang" />
            <div className="auth-hero-overlay" />

            <div className="hero-stats">
              <div className="hero-stat">
                <p className="hero-stat-val">{heroStats.posts}</p>
                <p className="hero-stat-label">{t('Local posts indexed')}</p>
              </div>
              <div className="hero-stat">
                <p className="hero-stat-val">{heroStats.states}</p>
                <p className="hero-stat-label">{t('Malaysian states')}</p>
              </div>
              <div className="hero-stat">
                <p className="hero-stat-val">{heroStats.territories}</p>
                <p className="hero-stat-label">{t('Federal territories')}</p>
              </div>
            </div>

            <div className="auth-hero-content">
              <span className="hero-badge">
                <span className="material-symbols-outlined">auto_awesome</span> {t('AI Concierge')}
              </span>
              <p className="hero-quote">
                &ldquo;{t('See Malaysia the way locals do — guided by thousands of real voices, not tourist brochures.')}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
