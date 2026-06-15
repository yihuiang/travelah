import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import HomeTopNav from '../components/home/HomeTopNav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getSuggestionsFromPreferences, isIdentityComplete } from '../utils/preferenceSuggestions.js'
import '../styles/home-v2.css'
import '../styles/plan-v2.css'

const STEPS = [
  { id: 1, label: 'Where' },
  { id: 2, label: 'When' },
  { id: 3, label: 'Vibe' },
  { id: 4, label: 'Style' },
  { id: 5, label: 'Review' },
]

const DESTINATIONS = [
  'Penang',
  'Kuala Lumpur',
  'Langkawi',
  'Kuching',
  'Sabah',
  'Cameron Highlands',
  'Melaka',
]

const VIBE_OPTIONS = [
  { id: 'culture', label: 'Culture & Heritage', sub: 'Temples, street art, history', icon: 'museum' },
  { id: 'food', label: 'Food First', sub: 'Hawker stalls, local eats', icon: 'restaurant' },
  { id: 'nature', label: 'Nature & Hiking', sub: 'Trails, parks, waterfalls', icon: 'forest' },
  { id: 'adventure', label: 'Adventure', sub: 'Diving, climbing, rafting', icon: 'surfing' },
  { id: 'relax', label: 'Relax & Unwind', sub: 'Slow days, beaches, wellness', icon: 'spa' },
  { id: 'shopping', label: 'Markets & Shopping', sub: 'Night markets, local crafts', icon: 'storefront' },
]

const PACE_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed', sub: '2–3 stops/day', icon: 'coffee' },
  { id: 'balanced', label: 'Balanced', sub: '4–5 stops/day', icon: 'directions_walk' },
  { id: 'full', label: 'Full-on', sub: '6+ stops/day', icon: 'sprint' },
]

const BUDGET_OPTIONS = [
  { id: 'shoestring', label: 'Shoestring', sub: 'Under RM150/day', icon: 'savings' },
  { id: 'mid', label: 'Mid-range', sub: 'RM150–400/day', icon: 'account_balance_wallet' },
  { id: 'splurge', label: 'Splurge', sub: 'RM400+/day', icon: 'diamond' },
]

const LEGACY_VIBE_MAP = {
  foodie: 'food',
  history: 'culture',
  nature: 'nature',
  shopping: 'shopping',
  museum: 'culture',
  popular: 'adventure',
}

function formatDate(d) {
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M9 0C4.029 0 0 4.029 0 9s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9zm.896 13.5h-1.8V8.1h1.8v5.4zm-.9-6.3a1.05 1.05 0 110-2.1 1.05 1.05 0 010 2.1z"
        fill="#1A1410"
      />
    </svg>
  )
}

export default function PlanPage() {
  const { user, isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [currentStep, setCurrentStep] = useState(1)
  const [destination, setDestination] = useState('')
  const [selectedChip, setSelectedChip] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [vibes, setVibes] = useState({})
  const [pace, setPace] = useState(null)
  const [budget, setBudget] = useState(null)
  const [extraNotes, setExtraNotes] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)
  const [appliedSuggestions, setAppliedSuggestions] = useState(false)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  const travelSuggestions = useMemo(
    () => getSuggestionsFromPreferences(user?.preferences),
    [user?.preferences],
  )

  useEffect(() => {
    if (!isAuthenticated || !isIdentityComplete(user?.preferences) || appliedSuggestions) return
    const suggested = travelSuggestions.suggestedVibes
    if (Object.keys(suggested).length === 0) return

    const mapped = {}
    for (const [key, value] of Object.entries(suggested)) {
      if (value && LEGACY_VIBE_MAP[key]) mapped[LEGACY_VIBE_MAP[key]] = true
    }
    if (Object.keys(mapped).length > 0) {
      setVibes((prev) => ({ ...prev, ...mapped }))
      setAppliedSuggestions(true)
    }
  }, [isAuthenticated, user?.preferences, travelSuggestions.suggestedVibes, appliedSuggestions])

  const dateSummary = useMemo(() => {
    if (!startDate || !endDate) return null
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (end <= start) return null
    const nights = Math.round((end - start) / 86400000)
    return {
      text: `${formatDate(start)} → ${formatDate(end)}`,
      nights,
    }
  }, [startDate, endDate])

  const review = useMemo(() => {
    const dest = destination.trim() || '—'
    let datesStr = '—'
    if (dateSummary) {
      datesStr = `${dateSummary.text.replace(' → ', ' – ')} (${dateSummary.nights} ${dateSummary.nights === 1 ? 'night' : 'nights'})`
    }
    const vibeLabels = VIBE_OPTIONS.filter((v) => vibes[v.id])
      .map((v) => v.label)
      .join(', ')
    const paceLabel = PACE_OPTIONS.find((p) => p.id === pace)?.label || '—'
    const budgetLabel = BUDGET_OPTIONS.find((b) => b.id === budget)?.label || '—'
    return { dest, datesStr, vibeLabels: vibeLabels || '—', paceLabel, budgetLabel }
  }, [destination, dateSummary, vibes, pace, budget])

  const goToStep = (n) => {
    setCurrentStep(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nextStep = (from) => {
    if (from === 4) goToStep(5)
    else if (from < 5) goToStep(from + 1)
  }

  const prevStep = (from) => {
    if (from > 1) goToStep(from - 1)
  }

  const selectDest = (name) => {
    setDestination(name)
    setSelectedChip(name)
  }

  const handleDestInput = (value) => {
    setDestination(value)
    setSelectedChip(null)
  }

  const toggleVibe = (id) => {
    setVibes((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const launchItinerary = () => {
    const vibeLabels = VIBE_OPTIONS.filter((v) => vibes[v.id])
      .map((v) => v.label)
      .join(', ')
    const paceLabel = PACE_OPTIONS.find((p) => p.id === pace)?.label || '—'
    const budgetLabel = BUDGET_OPTIONS.find((b) => b.id === budget)?.label || '—'

    setGenerating(true)
    setTimeout(() => {
      navigate('/itinerary', {
        state: {
          destination: destination.trim() || 'Penang',
          startDate,
          endDate,
          vibeLabels: vibeLabels || '—',
          paceLabel,
          budgetLabel,
          extraNotes,
        },
      })
    }, 1800)
  }

  const handleGenerate = () => {
    if (generating) return
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    launchItinerary()
  }

  const closeModal = () => {
    if (loginSubmitting) return
    setShowLoginModal(false)
    setLoginError('')
  }

  const handleModalLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    setLoginSubmitting(true)
    try {
      await login(loginEmail.trim(), loginPassword)
      setShowLoginModal(false)
      setLoginEmail('')
      setLoginPassword('')
      launchItinerary()
    } catch (err) {
      setLoginError(err.message || 'Sign in failed. Check your email and password.')
    } finally {
      setLoginSubmitting(false)
    }
  }

  return (
    <div className="home-v2 plan-v2 min-h-screen flex flex-col">
      <HomeTopNav activePage="plan" />

      <div className="step-progress" role="tablist" aria-label="Plan steps">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id
          const isDone = step.id < currentStep
          return (
            <button
              key={step.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`step-tab${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}
              onClick={() => goToStep(step.id)}
            >
              <span className="step-num">{step.id}</span>
              {step.label}
            </button>
          )
        })}
      </div>

      <div className="step-progress-spacer" aria-hidden="true" />

      <div className="plan-wrap">
        {/* Step 1 — Where */}
        <div className={`step-panel${currentStep === 1 ? ' active' : ''}`} id="step-1">
          <h1 className="step-headline">
            Where are you
            <br />
            <em>headed?</em>
          </h1>
          <p className="step-sub">Pick a destination or type one in.</p>
          <div className="field-wrap">
            <span className="material-symbols-outlined field-icon">search</span>
            <input
              className="field-input"
              type="text"
              value={destination}
              onChange={(e) => handleDestInput(e.target.value)}
              placeholder="e.g. Penang, Sabah, Melaka…"
            />
          </div>
          <div className="chips">
            {DESTINATIONS.map((name) => (
              <button
                key={name}
                type="button"
                className={`chip${selectedChip === name ? ' active' : ''}`}
                onClick={() => selectDest(name)}
              >
                <span className="material-symbols-outlined">place</span>
                {name}
              </button>
            ))}
          </div>
          <div className="step-nav">
            <button type="button" className="btn-next" onClick={() => nextStep(1)}>
              Next — When? <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Step 2 — When */}
        <div className={`step-panel${currentStep === 2 ? ' active' : ''}`} id="step-2">
          <h1 className="step-headline">
            When are you
            <br />
            <em>travelling?</em>
          </h1>
          <p className="step-sub">Set your start and end dates — we&apos;ll calculate your trip length.</p>
          <div className="date-row">
            <div className="date-field">
              <label className="date-label" htmlFor="date-start">
                Check-in
              </label>
              <input
                className="date-input"
                type="date"
                id="date-start"
                min={today}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (endDate && e.target.value >= endDate) setEndDate('')
                }}
              />
            </div>
            <div className="date-field">
              <label className="date-label" htmlFor="date-end">
                Check-out
              </label>
              <input
                className="date-input"
                type="date"
                id="date-end"
                min={startDate || today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          {dateSummary && (
            <div className="date-summary">
              <span className="material-symbols-outlined">calendar_month</span>
              <span className="date-summary-text">{dateSummary.text}</span>
              <span className="date-summary-dur">
                {dateSummary.nights} {dateSummary.nights === 1 ? 'night' : 'nights'}
              </span>
            </div>
          )}
          <div className="step-nav">
            <button type="button" className="btn-back" onClick={() => prevStep(2)}>
              <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <button type="button" className="btn-next" onClick={() => nextStep(2)}>
              Next — Vibe <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Step 3 — Vibe */}
        <div className={`step-panel${currentStep === 3 ? ' active' : ''}`} id="step-3">
          <h1 className="step-headline">
            What&apos;s the
            <br />
            <em>vibe?</em>
          </h1>
          <p className="step-sub">Pick everything that fits — we&apos;ll balance the mix.</p>
          <div className="option-grid-2">
            {VIBE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`option-card${vibes[option.id] ? ' active' : ''}`}
                onClick={() => toggleVibe(option.id)}
              >
                <span className="material-symbols-outlined">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                <span className="option-sub">{option.sub}</span>
              </button>
            ))}
          </div>
          <div className="step-nav">
            <button type="button" className="btn-back" onClick={() => prevStep(3)}>
              <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <button type="button" className="btn-next" onClick={() => nextStep(3)}>
              Next — Style <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Step 4 — Style */}
        <div className={`step-panel${currentStep === 4 ? ' active' : ''}`} id="step-4">
          <h1 className="step-headline">
            How do you
            <br />
            <em>travel?</em>
          </h1>
          <p className="step-sub">Pace and budget — we&apos;ll tailor the itinerary around this.</p>

          <p className="section-kicker">Pace</p>
          <div className="option-grid-3" style={{ marginBottom: 32 }}>
            {PACE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`option-card${pace === option.id ? ' active' : ''}`}
                onClick={() => setPace(option.id)}
              >
                <span className="material-symbols-outlined">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                <span className="option-sub">{option.sub}</span>
              </button>
            ))}
          </div>

          <p className="section-kicker">Budget</p>
          <div className="option-grid-3" style={{ marginBottom: 32 }}>
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`option-card${budget === option.id ? ' active' : ''}`}
                onClick={() => setBudget(option.id)}
              >
                <span className="material-symbols-outlined">{option.icon}</span>
                <span className="option-label">{option.label}</span>
                <span className="option-sub">{option.sub}</span>
              </button>
            ))}
          </div>

          <p className="section-kicker">
            Anything else? <span className="section-kicker-optional">(optional)</span>
          </p>
          <textarea
            className="prompt-area"
            rows={3}
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="Type in Malay, Chinese, or English — e.g. 'not a resort person', 'halal food only', 'travelling with elderly parents'…"
          />
          <p className="prompt-hint">We understand Bahasa Malaysia, Mandarin, and English.</p>

          <div className="step-nav">
            <button type="button" className="btn-back" onClick={() => prevStep(4)}>
              <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <button type="button" className="btn-next" onClick={() => nextStep(4)}>
              Review my trip <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Step 5 — Review */}
        <div className={`step-panel${currentStep === 5 ? ' active' : ''}`} id="step-5">
          <h1 className="step-headline">
            Looks good?
            <br />
            <em>Let&apos;s generate.</em>
          </h1>
          <p className="step-sub">Review your preferences before we build the itinerary.</p>

          <div className="review-block">
            <div className="review-row">
              <span className="review-key">Destination</span>
              <button type="button" className="review-edit" onClick={() => goToStep(1)}>
                Edit
              </button>
            </div>
            <div className="review-val">{review.dest}</div>
            <div className="review-divider" />
            <div className="review-row">
              <span className="review-key">Dates</span>
              <button type="button" className="review-edit" onClick={() => goToStep(2)}>
                Edit
              </button>
            </div>
            <div className="review-val">{review.datesStr}</div>
            <div className="review-divider" />
            <div className="review-row">
              <span className="review-key">Vibe</span>
              <button type="button" className="review-edit" onClick={() => goToStep(3)}>
                Edit
              </button>
            </div>
            <div className="review-val">{review.vibeLabels}</div>
            <div className="review-divider" />
            <div className="review-row">
              <span className="review-key">Pace</span>
              <button type="button" className="review-edit" onClick={() => goToStep(4)}>
                Edit
              </button>
            </div>
            <div className="review-val">{review.paceLabel}</div>
            <div className="review-divider" />
            <div className="review-row">
              <span className="review-key">Budget</span>
              <button type="button" className="review-edit" onClick={() => goToStep(4)}>
                Edit
              </button>
            </div>
            <div className="review-val">{review.budgetLabel}</div>
          </div>

          <div className="step-nav">
            <button type="button" className="btn-back" onClick={() => prevStep(5)} disabled={generating}>
              <span className="material-symbols-outlined">arrow_back</span> Back
            </button>
            <button
              type="button"
              className="btn-generate"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="material-symbols-outlined spin">hourglass_empty</span>
                  Building your trip…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate my itinerary
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Login modal */}
      <div
        className={`modal-overlay${showLoginModal ? ' open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal()
        }}
        role="presentation"
      >
        <div className="plan-modal" role="dialog" aria-modal="true" aria-labelledby="plan-login-title">
          <button type="button" className="modal-close" onClick={closeModal} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              close
            </span>
          </button>
          <p className="modal-eyebrow">One more step</p>
          <h2 className="modal-headline" id="plan-login-title">
            Sign in to
            <br />
            <em>unlock your plan</em>
          </h2>
          <p className="modal-sub">
            Your itinerary is ready to generate — just sign in first so we can save it for you.
          </p>

          <Link to="/login" state={{ background: location }} className="modal-social">
            <GoogleIcon />
            Continue with Google
          </Link>
          <Link to="/login" state={{ background: location }} className="modal-social">
            <AppleIcon />
            Continue with Apple
          </Link>

          <div className="modal-divider">
            <div className="modal-divider-line" />
            <span className="modal-divider-text">or</span>
            <div className="modal-divider-line" />
          </div>

          <form onSubmit={handleModalLogin}>
            {loginError && <p className="modal-error">{loginError}</p>}
            <input
              className="modal-field"
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              className="modal-field"
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button type="submit" className="modal-btn" disabled={loginSubmitting}>
              {loginSubmitting ? 'Signing in…' : 'Sign in & generate'}
            </button>
          </form>

          <p className="modal-footer-text">
            No account?{' '}
            <Link to="/register" state={{ background: location }}>
              Sign up free
            </Link>{' '}
            — takes 30 seconds.
          </p>
        </div>
      </div>
    </div>
  )
}
