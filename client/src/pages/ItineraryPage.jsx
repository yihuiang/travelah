import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ItineraryMap from '../components/itinerary/ItineraryMap.jsx'
import { PENANG_ITINERARY } from '../data/penangItinerary.js'
import '../styles/home-v2.css'
import '../styles/itinerary-v2.css'

function ItineraryTopNav() {
  return (
    <nav className="itin-topbar home-topbar">
      <Link to="/" className="nav-logo">
        travelah
      </Link>
      <ul className="nav-links">
        <li>
          <Link to="/explore">Explore</Link>
        </li>
        <li>
          <Link to="/plan">Plan</Link>
        </li>
        <li>
          <Link to="/trips">My Trips</Link>
        </li>
      </ul>
      <div className="nav-actions">
        <Link to="/plan" className="btn-outline-sm">
          <span className="material-symbols-outlined">edit</span> Replan
        </Link>
        <button type="button" className="btn-pill">
          <span className="material-symbols-outlined">download</span> Save PDF
        </button>
      </div>
    </nav>
  )
}

function ActivityTag({ tag }) {
  const cls = tag.type === 'source' ? 'tag-source' : tag.type === 'tip' ? 'tag-tip' : 'tag-cat'
  return <span className={`activity-tag ${cls}`}>{tag.label}</span>
}

function ActivityCard({ activity, saved, onToggleSave }) {
  return (
    <div className="activity-card">
      <div className="activity-time-col">
        <span className="activity-time-label">{activity.time}</span>
        <div className="activity-time-icon">
          <span className="material-symbols-outlined">{activity.icon}</span>
        </div>
      </div>
      <div className="activity-divider" />
      <div className="activity-body">
        <p className="activity-name">{activity.name}</p>
        <p className="activity-note">{activity.note}</p>
        {activity.tags?.length > 0 && (
          <div className="activity-tags">
            {activity.tags.map((tag) => (
              <ActivityTag key={tag.label} tag={tag} />
            ))}
          </div>
        )}
      </div>
      <div className="activity-card-right">
        {activity.likes && (
          <div className="activity-likes">
            <span className="material-symbols-outlined">favorite</span> {activity.likes}
          </div>
        )}
        <button
          type="button"
          className={`activity-save${saved ? ' saved' : ''}`}
          onClick={() => onToggleSave(activity.id)}
          aria-label={saved ? 'Remove bookmark' : 'Save activity'}
        >
          <span className="material-symbols-outlined">{saved ? 'bookmark' : 'bookmark_border'}</span>
        </button>
      </div>
    </div>
  )
}

function StayCard({ stay }) {
  return (
    <div className="stay-card">
      <div className="stay-icon">
        <span className="material-symbols-outlined">hotel</span>
      </div>
      <div className="stay-body">
        <p className="stay-label">Staying tonight</p>
        <p className="stay-name">{stay.name}</p>
        <p className="stay-meta">{stay.meta}</p>
      </div>
    </div>
  )
}

function formatPlanDates(start, end) {
  if (!start || !end) return null
  const s = new Date(start)
  const e = new Date(end)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e <= s) return null
  const fmt = (d) =>
    d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })
  const nights = Math.round((e - s) / 86400000)
  const shortFmt = (d) => d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  return {
    range: `${shortFmt(s)}–${shortFmt(e)} ${s.getFullYear()}`,
    nights,
    dayCount: nights + 1,
  }
}

export default function ItineraryPage() {
  const location = useLocation()
  const plan = location.state ?? {}
  const sectionRefs = useRef([])
  const [activeDay, setActiveDay] = useState(0)
  const [savedIds, setSavedIds] = useState(new Set())

  const itinerary = useMemo(() => {
    const base = { ...PENANG_ITINERARY }
    const dest = plan.destination?.trim() || base.destination
    const dates = formatPlanDates(plan.startDate, plan.endDate)

    if (dates) {
      base.dateRange = dates.range
      base.nights = dates.nights
      base.dayCount = dates.dayCount
    }

    if (plan.vibeLabels && plan.vibeLabels !== '—') {
      base.vibe = plan.vibeLabels.split(',')[0].trim()
    }
    if (plan.paceLabel && plan.paceLabel !== '—') {
      base.pace = `${plan.paceLabel} pace`
    }
    if (plan.budgetLabel && plan.budgetLabel !== '—') {
      base.budget = plan.budgetLabel
    }

    base.destination = dest
    return base
  }, [plan])

  const scrollToDay = (index) => {
    const el = sectionRefs.current[index]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveDay(index)
  }

  const handlePinClick = (pinNum) => {
    const index = itinerary.days.findIndex((d) => d.pin === pinNum)
    if (index >= 0) scrollToDay(index)
  }

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  useEffect(() => {
    const sections = sectionRefs.current.filter(Boolean)
    if (sections.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sections.findIndex((s) => s === entry.target)
            if (idx >= 0) setActiveDay(idx)
          }
        })
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )

    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [itinerary.days.length])

  const activePin = itinerary.days[activeDay]?.pin ?? 1

  return (
    <div className="home-v2 itin-v2 min-h-screen">
      <ItineraryTopNav />

      <div className="itin-hero">
        <div className="itin-hero-inner">
          <div>
            <div className="itin-eyebrow">
              <div className="itin-eyebrow-dot" />
              <span className="itin-eyebrow-text">Your itinerary — generated by TravelAh AI</span>
            </div>
            <h1 className="itin-headline">
              {itinerary.dayCount} Days in
              <br />
              <em>{itinerary.destination}.</em>
            </h1>
            <div className="itin-meta-row">
              <span className="itin-badge">
                <span className="material-symbols-outlined">calendar_month</span> {itinerary.dateRange}
              </span>
              <span className="itin-badge">
                <span className="material-symbols-outlined">nights_stay</span> {itinerary.nights} nights
              </span>
              <span className="itin-badge highlight">
                <span className="material-symbols-outlined">museum</span> {itinerary.vibe}
              </span>
              <span className="itin-badge">
                <span className="material-symbols-outlined">coffee</span> {itinerary.pace}
              </span>
              <span className="itin-badge">
                <span className="material-symbols-outlined">account_balance_wallet</span> {itinerary.budget}
              </span>
            </div>
          </div>
          <div className="itin-hero-right">
            <button type="button" className="itin-action primary">
              <span className="material-symbols-outlined">share</span> Share
            </button>
            <button type="button" className="itin-action">
              <span className="material-symbols-outlined">bookmark</span> Save to My Trips
            </button>
            <button type="button" className="itin-action">
              <span className="material-symbols-outlined">download</span> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="day-selector-wrap">
        <div className="day-selector" role="tablist" aria-label="Trip days">
          {itinerary.days.map((day, index) => (
            <button
              key={day.id}
              type="button"
              role="tab"
              aria-selected={activeDay === index}
              className={`day-tab${activeDay === index ? ' active' : ''}`}
              onClick={() => scrollToDay(index)}
            >
              <span className="day-tab-num">Day {day.num}</span>
              <span className="day-tab-label">{day.tabLabel}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="itin-body">
        <aside className="day-sidebar">
          <ItineraryMap activePin={activePin} onPinClick={handlePinClick} />
          {itinerary.days.map((day, index) => (
            <button
              key={day.id}
              type="button"
              className={`sidebar-day${activeDay === index ? ' active' : ''}`}
              onClick={() => scrollToDay(index)}
            >
              <div className="sidebar-day-dot">{day.num}</div>
              <div>
                <p className="sidebar-day-num">{day.sidebarDate}</p>
                <p className="sidebar-day-title">{day.sidebarTitle}</p>
              </div>
            </button>
          ))}
        </aside>

        <div className="day-content">
          {itinerary.days.map((day, index) => (
            <section
              key={day.id}
              id={day.id}
              className="day-section"
              ref={(el) => {
                sectionRefs.current[index] = el
              }}
            >
              <div className="day-section-header">
                <div>
                  <p className="day-section-eyebrow">Day {day.num}</p>
                  <h2 className="day-section-title">{day.title}</h2>
                </div>
                <span className="day-section-date">{day.date}</span>
              </div>

              <div className="activities">
                {day.activities.map((item, i) =>
                  item.connector ? (
                    <div key={`${day.id}-conn-${i}`} className="travel-connector">
                      <span className="material-symbols-outlined">arrow_downward</span>
                      <span className="travel-connector-text">{item.connector}</span>
                    </div>
                  ) : (
                    <ActivityCard
                      key={item.id}
                      activity={item}
                      saved={savedIds.has(item.id)}
                      onToggleSave={toggleSave}
                    />
                  ),
                )}
              </div>

              {!day.hideStay && <StayCard stay={itinerary.stay} />}
            </section>
          ))}
        </div>
      </div>

      <footer className="itin-footer">
        <div className="itin-footer-inner">
          <Link to="/" className="itin-footer-logo">
            travelah
          </Link>
          <ul className="itin-footer-nav">
            <li>
              <Link to="/explore">Destinations</Link>
            </li>
            <li>
              <a href="#heritage">Heritage</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
          </ul>
          <span className="itin-footer-copy">© {new Date().getFullYear()} travelah</span>
        </div>
      </footer>
    </div>
  )
}
