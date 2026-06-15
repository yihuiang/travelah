import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import HomeFooter from '../components/home/HomeFooter.jsx'
import HomeTopNav from '../components/home/HomeTopNav.jsx'
import TrendingSection from '../components/TrendingSection.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/home-v2.css'

const HERO_TILES = [
  {
    label: 'Kuala Lumpur',
    alt: 'Kuala Lumpur Petronas Towers',
    src: '/images/kuala-lumpur.png?v=2',
    tall: true,
    objectPosition: 'center top',
  },
  {
    label: 'Penang',
    alt: 'Penang George Town heritage street',
    src: '/images/penang.png?v=2',
    objectPosition: 'center center',
    row: 1,
    col: 2,
  },
  {
    label: 'Batu Caves',
    alt: 'Batu Caves',
    src: 'https://images.unsplash.com/photo-1467720921878-3c7e86a0ffde?auto=format&fit=crop&w=600&q=80',
    row: 2,
    col: 2,
  },
]

const HERO_TAGS = ['Langkawi', 'Penang Heritage', 'Kuching', 'Cameron Highlands', 'Sabah Rainforest']

const MARQUEE_ITEMS = [
  'Explore Malaysia',
  'Local Intelligence',
  'Real Reviews',
  'Hidden Gems',
  'Kuala Lumpur',
  'Penang Heritage',
  'Sabah Wildlife',
  'AI Planner',
]

const STATS = [
  { num: '14K+', label: 'Local posts indexed' },
  { num: '13', label: 'Malaysian states' },
  { num: '4', label: 'Social platforms' },
  { num: '3', label: 'Languages' },
]

const PLACES = [
  {
    num: '01 — Penang',
    name: 'George Town',
    tag: 'Heritage · Food',
    src: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=400&q=80',
    alt: 'Penang',
  },
  {
    num: '02 — Kedah',
    name: 'Langkawi',
    tag: 'Island · Nature',
    src: 'https://images.unsplash.com/photo-1591945536032-9c20451cd41f?auto=format&fit=crop&w=400&q=80',
    alt: 'Langkawi',
  },
  {
    num: '03 — Sabah',
    name: 'Kota Kinabalu',
    tag: 'Adventure · Diving',
    src: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&w=400&q=80',
    alt: 'Sabah',
  },
  {
    num: '04 — Pahang',
    name: 'Taman Negara',
    tag: 'Jungle · Wildlife',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=400&q=80',
    alt: 'Taman Negara',
  },
]

export default function HomePage() {
  const { ui } = useLanguage()

  return (
    <div className="home-v2">
      <HomeTopNav />

      <section className="home-hero">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            <span className="hero-eyebrow-text">Malaysia&apos;s travel intelligence</span>
          </div>

          <h1 className="hero-headline">
            The world
            <br />
            is <em>more</em>
            <br />
            <em>beautiful</em>
            <br />
            local.
          </h1>

          <p className="hero-sub">{ui.heroSubtitle}</p>

          <div className="hero-search">
            <span className="material-symbols-outlined" style={{ color: 'var(--sand)', marginRight: 4 }}>
              search
            </span>
            <input type="text" placeholder={ui.searchPlaceholder} />
            <Link to="/explore" className="btn-pill">
              {ui.exploreBtn}
            </Link>
          </div>

          <div className="hero-tags">
            {HERO_TAGS.map((label) => (
              <Link key={label} to="/explore" className="tag">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hero-right">
          {HERO_TILES.map((tile) => (
            <div
              key={tile.label}
              className={`hero-tile${tile.tall ? ' hero-tile-tall' : ''}`}
              style={
                tile.tall
                  ? { gridRow: '1 / 3', gridColumn: '1' }
                  : { gridRow: tile.row, gridColumn: tile.col }
              }
            >
              <img
                src={tile.src}
                alt={tile.alt}
                loading="eager"
                style={tile.objectPosition ? { objectPosition: tile.objectPosition } : undefined}
              />
              <div className="tile-label">{tile.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="stat-strip">
        {STATS.map((stat, index) => (
          <Fragment key={stat.label}>
            {index > 0 && <div className="stat-divider" />}
            <div className="stat-item">
              <span className="stat-num">{stat.num}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <div className="marquee-section" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`} className="marquee-item">
              <span className="marquee-dot" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <TrendingSection variant="bento" />

      <section className="planner-section" id="plan">
        <div className="planner-inner">
          <div className="planner-left">
            <span className="planner-eyebrow-badge">AI Concierge</span>
            <h2 className="planner-headline">
              Your trip,
              <br />
              <em>your language,</em>
              <br />
              your people.
            </h2>
            <p className="planner-sub">
              Tell us your vibe in Malay, Chinese, or English. We pull from thousands of real social
              posts to build an itinerary that actually fits how you travel.
            </p>
            <div className="planner-actions">
              <Link to="/plan" className="btn-lime">
                Start planning
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  east
                </span>
              </Link>
              <a href="#explore" className="btn-ghost">
                See examples
              </a>
            </div>
          </div>

          <div className="planner-right">
            <div className="chat-window">
              <div className="chat-msg user">
                <div className="chat-avatar">YI</div>
                <div className="chat-bubble">
                  Planning 5 days in Sabah, into hiking and local food. Not a resort person.
                </div>
              </div>

              <div className="chat-msg">
                <div className="chat-avatar ai-avatar">t</div>
                <div className="chat-bubble">
                  Got it — 5 days, Kinabalu foothills + Kota Belud tamu market + seafood at Kg.
                  Nelayan. I&apos;ll skip the resort strips entirely. Want me to add a night in
                  Kundasang?
                </div>
              </div>

              <div className="chat-msg user">
                <div className="chat-avatar">YI</div>
                <div className="chat-bubble">Yes! And budget-ish accommodation if possible 🙏</div>
              </div>

              <div className="chat-msg">
                <div className="chat-avatar ai-avatar">t</div>
                <div className="chat-typing">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>

            <div className="chat-input-bar">
              <span>Describe your trip in any language…</span>
              <button type="button" className="chat-send" aria-label="Send">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_upward
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="section-header">
          <div>
            <p className="section-eyebrow">Top destinations</p>
            <h2 className="section-title">
              Go here
              <br />
              next.
            </h2>
          </div>
          <Link to="/explore" className="section-link">
            All destinations →
          </Link>
        </div>

        <div className="places-grid">
          {PLACES.map((place) => (
            <Link key={place.name} to="/explore" className="place-card">
              <img src={place.src} alt={place.alt} loading="lazy" />
              <div className="place-info">
                <p className="place-num">{place.num}</p>
                <p className="place-name">{place.name}</p>
                <span className="place-tag">{place.tag}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="testimonial-section">
        <blockquote className="testimonial-q">
          &ldquo;We found a waterfall in Perak that wasn&apos;t on any blog. It felt like having a
          local as a guide.&rdquo;
        </blockquote>
        <div className="testimonial-author">
          <div className="t-avatar">AR</div>
          <span className="t-name">Arif Rahman — Singapore</span>
        </div>
      </div>

      <HomeFooter />
    </div>
  )
}
