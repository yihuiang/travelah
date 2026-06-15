import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeTopNav from '../components/home/HomeTopNav.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/home-v2.css'
import '../styles/trips-v2.css'

const STATS = [
  { value: '3', label: 'Trips planned' },
  { value: '14', label: 'Nights booked' },
  { value: '5', label: 'States visited' },
  { value: '42', label: 'Places saved' },
]

const TRIP_CARDS = [
  {
    id: 'penang',
    href: '/itinerary',
    featured: true,
    overlay: 'rust',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=80',
    alt: 'Penang',
    badge: 'live',
    badgeLabel: 'Active now',
    weather: '31°C',
    dates: '12–16 Jan 2026 · Day 3 of 5',
    name: '5 Days in Penang',
    meta: [
      { icon: 'near_me', text: 'Penang Hill in 2h' },
      { text: 'Culture & Heritage' },
      { text: 'Relaxed pace' },
    ],
  },
  {
    id: 'melaka',
    href: '/itinerary',
    overlay: 'dark',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    alt: 'Melaka',
    badge: 'upcoming',
    badgeLabel: 'In 28 days',
    dates: 'Feb 14–16, 2026',
    name: 'Melaka Weekend',
    meta: [{ text: '3 nights · Food & Culture' }],
  },
  {
    id: 'sabah',
    href: '/itinerary',
    overlay: 'dark',
    image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&w=600&q=80',
    alt: 'Sabah',
    badge: 'upcoming',
    badgeLabel: 'In 62 days',
    dates: 'Mar 20–26, 2026',
    name: 'Sabah Adventure',
    meta: [{ text: '7 nights · Nature & Diving' }],
  },
]

const UPCOMING = [
  {
    id: 'melaka-list',
    href: '/itinerary',
    thumb: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=120&q=80',
    dest: 'Melaka',
    name: 'Melaka Weekend — Jonker St & Heritage Trail',
    date: '14 – 16 Feb 2026 · 3 nights',
    countdown: '28 days away',
    tags: 'Food · Culture',
  },
  {
    id: 'sabah-list',
    href: '/itinerary',
    thumb: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&w=120&q=80',
    dest: 'Sabah',
    name: 'Sabah Adventure — Kinabalu, Sipadan & Seafood',
    date: '20 – 26 Mar 2026 · 7 nights',
    countdown: '62 days away',
    tags: 'Nature · Adventure',
  },
]

const CHECKLIST = [
  { id: 'passport', label: 'Passport & MyKad', defaultChecked: true },
  { id: 'hotel', label: 'Accommodation confirmed', defaultChecked: true },
  { id: 'bus', label: 'Bus tickets (KL → Penang)', defaultChecked: true },
  { id: 'insurance', label: 'Travel insurance', defaultChecked: false },
  { id: 'charger', label: 'Portable charger', defaultChecked: false },
  { id: 'cash', label: 'Cash in small notes (hawker stalls)', defaultChecked: false },
]

const SUGGESTIONS = [
  {
    name: 'Taman Negara',
    meta: 'Pahang · Nature · 4.9K posts',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Cameron Highlands',
    meta: 'Pahang · Nature · 3.8K posts',
    image: 'https://images.unsplash.com/photo-1482192505345-5852b4040dc7?auto=format&fit=crop&w=120&q=80',
  },
]

function CheckItem({ id, label, checked, onToggle }) {
  return (
    <button type="button" className={`check-item${checked ? ' done' : ''}`} onClick={() => onToggle(id)}>
      <span className="check-box">
        {checked && (
          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
            check
          </span>
        )}
      </span>
      <span className="check-label">{label}</span>
    </button>
  )
}

function TripMeta({ items }) {
  return (
    <div className="trip-meta">
      {items.map((item, i) => (
        <span key={item.text} style={{ display: 'contents' }}>
          {i > 0 && <span className="dot" />}
          {item.icon ? (
            <>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.text}</span>
            </>
          ) : (
            <span>{item.text}</span>
          )}
        </span>
      ))}
    </div>
  )
}

export default function TripsPage() {
  const { user, isAuthenticated } = useAuth()
  const [viewMode, setViewMode] = useState('grid')
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(CHECKLIST.map((item) => [item.id, item.defaultChecked])),
  )

  const displayName = useMemo(() => {
    if (!isAuthenticated || !user) return null
    const name = user.displayName || user.username || user.email?.split('@')[0]
    return name ? name.split(' ')[0] : null
  }, [isAuthenticated, user])

  const checklistDone = CHECKLIST.filter((item) => checked[item.id]).length

  const toggleCheck = (id) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="home-v2 trips-v2 min-h-screen flex flex-col">
      <HomeTopNav activePage="trips" />

      <div className="page-hero">
        <div className="page-hero-inner">
          <div>
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              <span className="hero-eyebrow-text">
                {displayName ? `Logged in as ${displayName}` : 'Your travel dashboard'}
              </span>
            </div>
            <h1 className="hero-headline">
              Your
              <br />
              <em>journeys.</em>
            </h1>
            <p className="hero-sub">3 trips planned, 1 active. Where to next?</p>
          </div>
          <Link to="/plan" className="btn-plan">
            <span className="material-symbols-outlined">add</span> Plan new trip
          </Link>
        </div>
      </div>

      <div className="stats-strip">
        <div className="stats-inner">
          {STATS.map((stat, i) => (
            <span key={stat.label} style={{ display: 'contents' }}>
              {i > 0 && <span className="stat-divider" aria-hidden="true" />}
              <div className="stat-item">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </span>
          ))}
        </div>
      </div>

      <main className="page-wrap">
        <section className="trips-section">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">Saved itineraries</p>
              <h2 className="section-title">All Trips</h2>
            </div>
            <div className="view-toggle">
              <button
                type="button"
                className={`view-btn${viewMode === 'grid' ? ' active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <span className="material-symbols-outlined">grid_view</span>
              </button>
              <button
                type="button"
                className={`view-btn${viewMode === 'list' ? ' active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <span className="material-symbols-outlined">format_list_bulleted</span>
              </button>
            </div>
          </div>

          <div className={`trips-grid${viewMode === 'list' ? ' list-mode' : ''}`}>
            {TRIP_CARDS.map((trip) => (
              <Link
                key={trip.id}
                to={trip.href}
                className={`trip-card${trip.featured ? ' featured' : ''}`}
              >
                <img src={trip.image} alt={trip.alt} />
                <div className={`trip-overlay ${trip.overlay}`} />
                <div className="trip-content">
                  <div className="trip-top">
                    <span className={`trip-badge ${trip.badge}`}>
                      {trip.badge === 'live' && (
                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                          radio_button_checked
                        </span>
                      )}
                      {trip.badgeLabel}
                    </span>
                    {trip.weather && (
                      <span className="trip-weather">
                        <span className="material-symbols-outlined">wb_sunny</span> {trip.weather}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="trip-dates">{trip.dates}</p>
                    <h3 className="trip-name">{trip.name}</h3>
                    <TripMeta items={trip.meta} />
                  </div>
                </div>
              </Link>
            ))}

            <Link to="/plan" className="trip-card-new">
              <span className="material-symbols-outlined">add_circle</span>
              <span className="trip-card-new-label">Plan a new trip</span>
              <span className="trip-card-new-sub">Let AI build your itinerary</span>
            </Link>
          </div>
        </section>

        <section className="trips-section">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">What&apos;s next</p>
              <h2 className="section-title">Upcoming</h2>
            </div>
          </div>
          <div className="upcoming-list">
            {UPCOMING.map((item) => (
              <Link key={item.id} to={item.href} className="upcoming-item">
                <img className="upcoming-thumb" src={item.thumb} alt={item.dest} />
                <div className="upcoming-body">
                  <p className="upcoming-dest">{item.dest}</p>
                  <p className="upcoming-name">{item.name}</p>
                  <p className="upcoming-date">{item.date}</p>
                </div>
                <div className="upcoming-right">
                  <span className="upcoming-countdown">{item.countdown}</span>
                  <span className="upcoming-nights">{item.tags}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="trips-section">
          <div className="section-head">
            <div>
              <p className="section-eyebrow">Trip tools</p>
              <h2 className="section-title">Manage & Plan</h2>
            </div>
          </div>

          <div className="bento-grid">
            <div className="bento-card">
              <div className="bento-head">
                <h3 className="bento-title">Packing List</h3>
                <div className="bento-icon">
                  <span className="material-symbols-outlined">backpack</span>
                </div>
              </div>
              <p className="check-kicker">
                Penang Trip · {checklistDone} of {CHECKLIST.length} done
              </p>
              {CHECKLIST.map((item) => (
                <CheckItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  checked={checked[item.id]}
                  onToggle={toggleCheck}
                />
              ))}
              <button type="button" className="check-add">
                <span className="material-symbols-outlined">add</span> Add item
              </button>
            </div>

            <div className="bento-card">
              <div className="bento-head">
                <h3 className="bento-title">Trip Budget</h3>
                <div className="bento-icon">
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                </div>
              </div>
              <p className="finance-kicker">Penang · 5 days</p>
              <div className="finance-row">
                <span className="finance-amount">RM 680</span>
                <span className="finance-of">of RM 1,200</span>
              </div>
              <div className="finance-bar-wrap">
                <div className="finance-bar">
                  <div className="finance-fill" style={{ width: '57%' }} />
                </div>
                <p className="finance-pct">57% spent · RM 520 remaining</p>
              </div>
              <div className="finance-split">
                <div>
                  <p className="finance-cell-label">Stays</p>
                  <p className="finance-cell-val">RM 360</p>
                </div>
                <div>
                  <p className="finance-cell-label">Food</p>
                  <p className="finance-cell-val">RM 210</p>
                </div>
                <div>
                  <p className="finance-cell-label">Transport</p>
                  <p className="finance-cell-val">RM 110</p>
                </div>
              </div>
            </div>

            <div className="bento-card dark-card">
              <span className="material-symbols-outlined dark-sparkle">auto_awesome</span>
              <div className="bento-head">
                <h3 className="bento-title">Suggested for You</h3>
              </div>
              <p className="dark-kicker">Based on your trips</p>
              <p className="dark-body">
                You&apos;ve done heritage and food — here are two nature picks you haven&apos;t tried yet.
              </p>
              {SUGGESTIONS.map((place) => (
                <Link key={place.name} to="/explore" className="dark-place">
                  <img className="dark-place-img" src={place.image} alt={place.name} />
                  <div>
                    <p className="dark-place-name">{place.name}</p>
                    <p className="dark-place-meta">{place.meta}</p>
                  </div>
                </Link>
              ))}
              <Link to="/explore" className="btn-dark-outline">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  explore
                </span>
                Browse all suggestions
              </Link>
            </div>
          </div>
        </section>

        <section className="journal-cta">
          <div className="journal-icon">
            <span className="material-symbols-outlined">photo_library</span>
          </div>
          <h3 className="journal-title">Your travel journal</h3>
          <p className="journal-sub">
            We auto-generate a photo journal after each trip. Your Penang journal is ready.
          </p>
          <button type="button" className="journal-link">
            View journal <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        </section>
      </main>

      <footer className="trips-footer">
        <div className="trips-footer-inner">
          <Link to="/" className="trips-footer-logo">
            travelah
          </Link>
          <ul className="trips-footer-nav">
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
          <span className="trips-footer-copy">© {new Date().getFullYear()} travelah</span>
        </div>
      </footer>
    </div>
  )
}
