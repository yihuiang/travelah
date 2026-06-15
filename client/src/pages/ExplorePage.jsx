import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeTopNav from '../components/home/HomeTopNav.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import { getPlaceImageUrl } from '../utils/resolveImage.js'
import '../styles/home-v2.css'
import '../styles/explore-v2.css'

const FILTERS = ['ALL', 'FOOD', 'CULTURE', 'NATURE', 'HIDDEN GEMS', 'ADVENTURE']

const FILTER_LABELS = {
  ALL: 'All',
  FOOD: 'Food',
  CULTURE: 'Culture',
  NATURE: 'Nature',
  'HIDDEN GEMS': 'Hidden Gems',
  ADVENTURE: 'Adventure',
}

const MALAYSIA_STATES = [
  'ALL STATES',
  'Perlis',
  'Kedah',
  'Penang',
  'Perak',
  'Selangor',
  'Negeri Sembilan',
  'Melaka',
  'Johor',
  'Pahang',
  'Terengganu',
  'Kelantan',
  'Sabah',
  'Sarawak',
  'Kuala Lumpur',
  'Putrajaya',
  'Labuan',
]

const TRENDING_PILL_WIDTHS = [340, 320, 300, 280, 260]

const PAGE_SIZE = 9

function formatCategoryLabel(category) {
  if (!category) return 'Culture'
  return category
    .split(/[\s_]+/)
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

function formatLikes(place) {
  const label = (place.likesLabel || '').replace(/^🔥\s*/, '').trim()
  if (label) return label.replace(/\s*likes?$/i, '')
  const n = place.totalLikes || 0
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function trendingBadge(rank) {
  if (rank <= 3) return { icon: 'trending_up', label: 'Hot' }
  if (rank <= 9) return { icon: 'trending_up', label: 'Rising' }
  return { icon: 'trending_flat', label: 'Steady' }
}

function mapPlaceToCard(place, index) {
  const categories = place.categories?.length ? place.categories : ['CULTURE']
  return {
    id: place.id || place._id,
    rank: index + 1,
    rankLabel: String(index + 1).padStart(2, '0'),
    state: place.state || 'Malaysia',
    categories,
    image: getPlaceImageUrl(place.coverImage),
    title: place.name,
    description: place.description || '',
    likes: formatLikes(place),
    posts: place.postCount || 0,
    source: 'RedNote',
  }
}

function ExplorePlaceCard({ card }) {
  const badge = trendingBadge(card.rank)

  return (
    <Link to={`/explore/place/${card.id}`} className="explore-place-card">
      <div className="card-img-wrap">
        {card.image ? (
          <img src={card.image} alt={card.title} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
            <span className="material-symbols-outlined text-5xl">place</span>
          </div>
        )}
        <span className="card-rank">{card.rankLabel}</span>
        <span className="card-source-badge">
          <span className="material-symbols-outlined">photo_camera</span>
          {card.source}
        </span>
        <div className="card-arrow">
          <span className="material-symbols-outlined">arrow_forward</span>
        </div>
      </div>
      <div className="card-body">
        <div className="card-meta-row">
          <span className="explore-badge badge-state">{card.state}</span>
          {card.categories.slice(0, 2).map((tag) => (
            <span key={tag} className="explore-badge badge-cat">
              {formatCategoryLabel(tag)}
            </span>
          ))}
        </div>
        <h3 className="explore-card-title">{card.title}</h3>
        <p className="explore-card-desc">{card.description}</p>
        <div className="card-stats">
          <span className="explore-stat-item">
            <span className="material-symbols-outlined">favorite</span>
            {card.likes}
          </span>
          <span className="explore-stat-item">
            <span className="material-symbols-outlined">article</span>
            {card.posts} posts
          </span>
          <span className="trending-badge">
            <span className="material-symbols-outlined">{badge.icon}</span>
            {badge.label}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function ExplorePage() {
  const { ui } = useLanguage()
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [activeState, setActiveState] = useState('ALL STATES')
  const [places, setPlaces] = useState([])
  const [topPlaces, setTopPlaces] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/places?limit=5&state=ALL%20STATES&category=ALL')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setTopPlaces(data.map((p, i) => mapPlaceToCard(p, i)))
      })
      .catch(() => {
        if (!cancelled) setTopPlaces([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({
      limit: '200',
      state: activeState,
      category: activeFilter,
    })
    fetch(`/api/places?${params}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load places')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setPlaces(data.map((p, i) => mapPlaceToCard(p, i)))
          setCurrentPage(1)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [activeFilter, activeState])

  const totalPages = Math.max(1, Math.ceil(places.length / PAGE_SIZE))
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const pagedPlaces = places.slice(pageStart, pageStart + PAGE_SIZE)

  const pageNumbers = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages = [1]
    if (currentPage > 3) pages.push('…')
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p += 1) {
      if (!pages.includes(p)) pages.push(p)
    }
    if (currentPage < totalPages - 2) pages.push('…')
    if (!pages.includes(totalPages)) pages.push(totalPages)
    return pages
  })()

  return (
    <div className="home-v2 explore-v2">
      <HomeTopNav activePage="explore" />

      <div className="explore-page">
        <section className="explore-hero">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-dot" />
              <span className="hero-eyebrow-text">Ranked by social buzz</span>
            </div>
            <h1 className="explore-hero-headline">
              The pulse
              <br />
              of <em>Malaysia.</em>
            </h1>
            <p className="explore-hero-sub">
              Trending spots ranked by real posts from Social Media.
            </p>
          </div>

          <div className="explore-hero-right">
            {topPlaces.map((place, index) => (
              <Link
                key={place.id}
                to={`/explore/place/${place.id}`}
                className="trending-pill"
                style={{ width: TRENDING_PILL_WIDTHS[index] || 260 }}
              >
                <span className="tp-rank">{place.rankLabel}</span>
                <span className="tp-name">{place.title}</span>
                <span className="tp-tag">{formatCategoryLabel(place.categories[0])}</span>
                <span className="tp-stat">
                  <span className="material-symbols-outlined">favorite</span>
                  {place.likes}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="filter-bar">
          <div className="filter-left">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-btn${activeFilter === filter ? ' active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {FILTER_LABELS[filter]}
              </button>
            ))}
          </div>
          <div className="filter-right">
            <div className="state-select-wrap">
              <select
                className="state-select"
                value={activeState}
                onChange={(e) => setActiveState(e.target.value)}
                aria-label="Filter by state"
              >
                {MALAYSIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state === 'ALL STATES' ? 'All States' : state}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined">expand_more</span>
            </div>
            <button type="button" className="sort-btn">
              Trending now
              <span className="material-symbols-outlined">swap_vert</span>
            </button>
          </div>
        </div>

        {!loading && !error && places.length > 0 && (
          <p className="result-count">
            Showing <span>{pageStart + 1}–{Math.min(pageStart + PAGE_SIZE, places.length)}</span> of{' '}
            <span>{places.length}</span> places
          </p>
        )}

        {loading ? (
          <p className="explore-status">{ui.loadingTrending}</p>
        ) : error ? (
          <p className="explore-status">
            Could not load places. Run <code>python nlp/extract_places.py</code> and{' '}
            <code>npm run seed:places</code> in server.
          </p>
        ) : places.length === 0 ? (
          <p className="explore-status">No places for this filter yet. Try another state or category.</p>
        ) : (
          <>
            <section className="cards-grid">
              {pagedPlaces.map((card) => (
                <ExplorePlaceCard key={card.id} card={card} />
              ))}
            </section>

            <div className="explore-pagination">
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <div className="page-controls">
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  ← Prev
                </button>
                {pageNumbers.map((page, index) =>
                  page === '…' ? (
                    <span key={`ellipsis-${index}`} style={{ color: 'var(--muted)', fontSize: 13 }}>
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      className={`page-btn${currentPage === page ? ' current' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <HomeFooter />
    </div>
  )
}
