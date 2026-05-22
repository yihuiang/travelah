import { useEffect, useState } from 'react'
import HeaderNav from '../components/HeaderNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const FILTERS = ['ALL', 'FOOD', 'CULTURE', 'NATURE', 'HIDDEN GEMS']

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

function formatSaved(collected) {
  if (!collected) return '—'
  return `${collected} SAVED`
}

function mapToExploreCard(item, index) {
  const categories = item.categories?.length ? item.categories : [item.category].filter(Boolean)
  const tags = categories.slice(0, 2)
  return {
    id: item.id,
    rank: String(index + 1).padStart(2, '0'),
    state: item.state || 'Malaysia',
    categories,
    image: item.image,
    alt: item.title,
    title: item.title,
    description: item.description,
    tags,
    likes: (item.likesLabel || item.likes || '—').replace(/^🔥\s*/, '').toUpperCase(),
    saved: formatSaved(item.collected),
    source: item.sourceLabel || 'VIA REDNOTE',
    sourceIcon: item.sourceIcon || 'database',
    noteUrl: item.noteUrl,
  }
}

function ExploreCard({ card }) {
  return (
    <article className="flex flex-col group">
      <div className="relative mb-6">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
          <img
            alt={card.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={card.image}
          />
          <div className="absolute top-4 right-6 rank-number-outline font-headline-lg text-4xl italic">
            {card.rank}
          </div>
        </div>
        <div className="absolute -bottom-6 -right-1 bg-surface w-16 h-16 rounded-tl-[2rem] flex items-center justify-center">
          <button
            type="button"
            className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors cursor-pointer"
            aria-label="Save"
          >
            <span className="material-symbols-outlined text-xl">bookmark</span>
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-headline-md text-2xl text-primary mb-2">{card.title}</h3>
        <p className="font-body-md text-sm text-on-surface-variant mb-4 line-clamp-2">{card.description}</p>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-3 py-1 rounded-full text-[10px] font-label-caps bg-surface-container text-on-surface-variant border border-outline-variant/40">
            {card.state}
          </span>
          {card.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full text-[10px] font-label-caps ${
                tag === card.tags[0]
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-outline-variant/20">
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">favorite</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{card.likes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">bookmark</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{card.saved}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="font-label-caps text-[9px] text-primary/50">{card.source}</span>
              <span className="material-symbols-outlined text-[16px] opacity-60 text-secondary">
                {card.sourceIcon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function matchesCategory(card, filter) {
  if (filter === 'ALL') return true
  return card.categories?.includes(filter)
}

function matchesState(card, state) {
  if (state === 'ALL STATES') return true
  return card.state === state
}

export default function ExplorePage() {
  const { language, ui } = useLanguage()
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [activeState, setActiveState] = useState('ALL STATES')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/trending?limit=100&lang=${encodeURIComponent(language)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load explore posts')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) setPosts(data.map(mapToExploreCard))
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
  }, [language])

  const filteredCards = posts.filter(
    (card) => matchesCategory(card, activeFilter) && matchesState(card, activeState),
  )

  return (
    <div className="text-on-surface font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture relative overflow-x-hidden">
      <span className="material-symbols-outlined batik-watermark text-[400px] text-primary -top-20 -left-20 rotate-12 pointer-events-none">
        local_florist
      </span>
      <span className="material-symbols-outlined batik-watermark text-[300px] text-primary top-1/2 -right-20 -rotate-12 pointer-events-none">
        waves
      </span>
      <span className="material-symbols-outlined batik-watermark text-[250px] text-primary bottom-0 left-1/4 rotate-45 pointer-events-none">
        spa
      </span>

      <HeaderNav activePage="explore" />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-40 pb-20 z-10 relative">
        <section className="mb-20 relative">
          <div className="max-w-2xl">
            <h1 className="font-display-lg text-display-lg md:text-[96px] text-primary mb-6 leading-none">
              The Pulse
              <br />
              <span className="italic font-light">of Malaysia</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              The most talked-about destinations, flavors, and cultural moments trending across the
              peninsula right now.
            </p>
          </div>
        </section>

        <section className="flex flex-col gap-4 mb-16">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container rounded-full border border-outline-variant/30">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-2.5 rounded-full font-label-caps text-[11px] tracking-widest transition-all ${
                    activeFilter === filter
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-primary hover:bg-white/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-3 px-8 py-3 rounded-full border border-primary text-primary font-label-caps text-[11px] tracking-widest hover:bg-primary hover:text-on-primary transition-all shrink-0"
            >
              SORT BY: TRENDING NOW
              <span className="material-symbols-outlined text-sm">swap_vert</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-label-caps text-[11px] tracking-widest text-on-surface-variant">
              STATE
            </span>
            <div className="relative">
              <select
                value={activeState}
                onChange={(e) => setActiveState(e.target.value)}
                className="appearance-none pl-5 pr-10 py-2.5 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-primary font-label-caps text-[11px] tracking-widest cursor-pointer hover:border-primary focus:border-primary focus:outline-none min-w-[180px]"
                aria-label="Filter by state"
              >
                {MALAYSIA_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[20px] pointer-events-none">
                expand_more
              </span>
            </div>
            {activeState !== 'ALL STATES' && (
              <button
                type="button"
                onClick={() => setActiveState('ALL STATES')}
                className="font-label-caps text-[10px] text-secondary hover:text-primary transition-colors"
              >
                Clear state
              </button>
            )}
          </div>
        </section>

        <section>
          {loading ? (
            <p className="font-body-lg text-on-surface-variant text-center py-16">{ui.loadingTrending}</p>
          ) : error ? (
            <p className="font-body-lg text-on-surface-variant text-center py-16">
              Could not load posts. Run <code className="text-primary">npm run dev</code> and{' '}
              <code className="text-primary">npm run import:trending</code> in server.
            </p>
          ) : filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {filteredCards.map((card) => (
                <ExploreCard key={card.id} card={card} />
              ))}
            </div>
          ) : (
            <p className="font-body-lg text-on-surface-variant text-center py-16">
              No trending posts for this filter yet. Try another state or category.
            </p>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
