import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav.jsx'
import PlaceImage from '../components/PlaceImage.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import { getPlaceImageUrl, getPostImageUrl } from '../utils/resolveImage.js'
import { getMapEmbedUrl, getMapSearchUrl } from '../utils/placeMap.js'
import { useLanguage } from '../context/LanguageContext.jsx'

const CATEGORY_EXPERIENCES = {
  FOOD: {
    icon: 'restaurant',
    title: 'Culinary Discovery',
    blurb: 'Taste local flavours and street-food favourites highlighted by the community.',
    deco: 'local_florist',
  },
  CULTURE: {
    icon: 'museum',
    title: 'Heritage & Culture',
    blurb: 'Explore traditions, architecture, and stories woven into this destination.',
    deco: 'architecture',
  },
  NATURE: {
    icon: 'landscape',
    title: 'Nature & Views',
    blurb: 'Scenic outlooks, open air, and moments of quiet away from the rush.',
    deco: 'park',
  },
  'HIDDEN GEMS': {
    icon: 'explore',
    title: 'Hidden Corners',
    blurb: 'Lesser-known spots worth the detour — curated from trending posts.',
    deco: 'diamond',
  },
}

const STATE_ESSENTIALS = {
  Penang: { bestTime: 'November to February — drier, pleasant evenings.', gettingAround: 'Walkable heritage core; Grab for longer hops.' },
  Sabah: { bestTime: 'March to October — clearer skies for Kinabalu views.', gettingAround: 'Rent a car or book day tours from Kota Kinabalu.' },
  Melaka: { bestTime: 'June to August — festive nights along the river.', gettingAround: 'Compact old town; trishaws add charm on short routes.' },
  'Kuala Lumpur': { bestTime: 'Year-round; mornings are cooler for walking.', gettingAround: 'MRT and Grab; central districts are easy to navigate.' },
  Pahang: { bestTime: 'Highlands feel best April–August; check monsoon for coast.', gettingAround: 'Self-drive or resort shuttles in Cameron / Genting.' },
  Perak: { bestTime: 'Dry season months for Ipoh food trails and caves.', gettingAround: 'Ipoh centre is walkable; car helps for outskirts.' },
}

function estimateDuration(place) {
  const name = (place?.name || '').toLowerCase()
  if (/farmstay|resort|hotel|homestay|camping|retreat/.test(name)) return '1 – 2 Nights'
  if (/(trail|park|island|highlands)/.test(name)) return '1 – 2 Days'
  return '2 – 4 Hours'
}

function buildGalleryImages(coverImage, posts, placeName) {
  const seen = new Set()
  const items = []

  function addFromPost(post) {
    const src = getPostImageUrl(post)
    if (!src || seen.has(src)) return
    seen.add(src)
    items.push({ src, title: post.title, subtitle: post.location })
  }

  const cover = getPlaceImageUrl(coverImage)
  if (cover && !seen.has(cover)) {
    seen.add(cover)
    items.push({ src: cover, title: placeName, subtitle: null })
  }
  for (const post of posts) {
    addFromPost(post)
  }
  return items
}

function ExperienceCard({ icon, title, blurb, deco }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-[0px_4px_20px_rgba(44,44,44,0.02)] hover:shadow-[0px_8px_30px_rgba(44,44,44,0.08)] transition-all group cursor-default relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none">
        <span className="material-symbols-outlined text-[120px]">{deco}</span>
      </div>
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <h4 className="font-headline-md text-[24px] text-primary mb-2">{title}</h4>
      <p className="font-body-md text-on-surface-variant">{blurb}</p>
    </div>
  )
}

function JournalEntry({ author, text, meta }) {
  const initial = (author || 'T').charAt(0).toUpperCase()
  return (
    <div className="flex gap-6">
      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-container border border-outline-variant flex items-center justify-center font-headline-md text-primary">
        {initial}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h4 className="font-body-md font-bold text-primary">{author || 'Traveler'}</h4>
          {meta && <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">{meta}</span>}
        </div>
        <div className="flex text-secondary-container mb-3 text-[14px]">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className="material-symbols-outlined"
              style={{ fontVariationSettings: n <= 4 ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          ))}
        </div>
        <p className="font-body-md text-on-surface-variant line-clamp-4">{text}</p>
      </div>
    </div>
  )
}

export default function PlaceDetailPage() {
  const { id } = useParams()
  const { language } = useLanguage()
  const [place, setPlace] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/places/${id}/posts?lang=${encodeURIComponent(language)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Place not found')
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setPlace(data.place)
          setPosts(data.posts || [])
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
  }, [id, language])

  const gallery = useMemo(
    () => (place ? buildGalleryImages(place.coverImage, posts, place.name) : []),
    [place, posts],
  )

  const experiences = useMemo(() => {
    const cats = place?.categories?.length ? place.categories : ['CULTURE']
    return cats.slice(0, 2).map((cat) => CATEGORY_EXPERIENCES[cat] || CATEGORY_EXPERIENCES.CULTURE)
  }, [place])

  const essentials = STATE_ESSENTIALS[place?.state] || {
    bestTime: 'Year-round; mornings and evenings are most comfortable.',
    gettingAround: 'Grab and e-hailing widely available across Malaysia.',
  }

  const locationLabel = place?.state && place.state !== 'Malaysia' ? `${place.state}, Malaysia` : 'Malaysia'
  const mapEmbedUrl = place ? getMapEmbedUrl(place) : null
  const mapSearchUrl = place ? (place.googleMapsUri || getMapSearchUrl(place)) : null
  const placeDescription =
    place?.googleDescription ||
    place?.description ||
    'A curated stop from the Travelah community — explore stories, flavours, and views linked below.'

  return (
    <div className="text-on-background font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      <HeaderNav activePage="explore" />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-36 md:pt-40 pb-32 relative z-10">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 font-label-caps text-[11px] text-primary mb-8 hover:opacity-80"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Explore
        </Link>

        {loading ? (
          <p className="font-body-lg text-on-surface-variant text-center py-16">Loading place…</p>
        ) : error ? (
          <p className="font-body-lg text-error text-center py-16">{error}</p>
        ) : place ? (
          <>
            {place && (
              <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-surface-container-lowest p-2 rounded-full shadow-[0px_8px_30px_rgba(92,30,5,0.15)] border border-outline-variant flex flex-col sm:flex-row items-center gap-2 sm:gap-4 max-w-[calc(100vw-2rem)]">
                <div className="px-4 sm:px-6 py-2 text-center sm:text-left">
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase">Estimated Duration</p>
                  <p className="font-body-lg text-primary font-medium">{estimateDuration(place)}</p>
                </div>
                <Link
                  to="/plan"
                  className="bg-secondary-container hover:bg-secondary text-on-secondary px-6 sm:px-8 py-3 sm:py-4 rounded-full font-body-md font-medium transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                >
                  <span className="material-symbols-outlined">add_location</span>
                  Add to Itinerary
                </Link>
              </div>
            )}

            <header className="mb-12 text-center md:text-left grid grid-cols-1 md:grid-cols-12 gap-gutter items-end">
              <div className="md:col-span-10">
                <p className="font-label-caps text-secondary uppercase mb-4 tracking-widest">{locationLabel}</p>
                <h1 className="font-display-lg text-[40px] sm:text-[48px] md:text-[64px] text-primary mb-6 leading-[1.05] tracking-[-0.02em]">
                  {place.name}
                </h1>
                <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto md:mx-0">
                  {placeDescription}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                  <span className="font-label-caps text-[10px] px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40">
                    {(place.likesLabel || '').replace(/^🔥\s*/, '').toUpperCase()}
                  </span>
                  <span className="font-label-caps text-[10px] px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant/40">
                    {place.postCount} RELATED POSTS
                  </span>
                  {(place.categories || []).map((cat) => (
                    <span
                      key={cat}
                      className="font-label-caps text-[10px] px-3 py-1.5 rounded-full bg-surface-container-low text-secondary border border-outline-variant/30"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </header>

            {gallery.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 min-h-[320px] md:h-[600px] mb-16 md:mb-20">
                <div className="md:col-span-2 md:row-span-2 rounded-xl overflow-hidden relative group min-h-[240px]">
                  <PlaceImage
                    src={gallery[0]?.src}
                    alt={gallery[0]?.title || place.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 min-h-[240px] md:min-h-full"
                  />
                </div>
                {gallery.slice(1, 4).map((item, i) => (
                  <div
                    key={item.src + i}
                    className={`md:col-span-1 rounded-xl overflow-hidden relative group min-h-[160px] ${
                      i === 2 ? 'md:col-span-2 md:row-span-1' : 'md:row-span-1'
                    }`}
                  >
                    <PlaceImage
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 min-h-[160px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="font-body-md text-sm line-clamp-2">{item.title}</p>
                    </div>
                  </div>
                ))}
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-20">
              <div className="lg:col-span-8">
                <div className="max-w-none">
                  <h2 className="font-headline-lg text-3xl md:text-4xl text-primary mb-6">Discover {place.name}</h2>
                  <p className="font-body-lg text-on-surface-variant mb-6 leading-relaxed">
                    {placeDescription}
                  </p>
                  {(place.googleRating != null || place.openingHours?.length > 0) && (
                    <div className="my-12 p-8 bg-surface-container-low border border-outline-variant/40 rounded-xl space-y-6">
                      {place.googleRating != null && (
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex text-secondary text-[18px]">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <span
                                key={n}
                                className="material-symbols-outlined text-[22px]"
                                style={{
                                  fontVariationSettings:
                                    n <= Math.round(place.googleRating) ? "'FILL' 1" : "'FILL' 0",
                                }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                          <span className="font-body-lg text-primary font-bold">
                            {place.googleRating.toFixed(1)}
                          </span>
                          {place.googleReviewCount != null && (
                            <span className="font-body-md text-on-surface-variant">
                              ({place.googleReviewCount.toLocaleString()} Google reviews)
                            </span>
                          )}
                        </div>
                      )}
                      {place.openingHours?.length > 0 && (
                        <div>
                          <p className="font-body-md text-[14px] text-on-surface-variant font-bold mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
                            Opening Hours
                          </p>
                          <ul className="space-y-1.5">
                            {place.openingHours.map((line) => (
                              <li key={line} className="font-body-md text-[14px] text-on-surface-variant">
                                {line}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <h3 className="font-headline-md text-2xl text-primary mb-4 mt-10">Curated Experiences</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {experiences.map((exp) => (
                      <ExperienceCard key={exp.title} {...exp} />
                    ))}
                  </div>
                </div>

                {posts.length > 0 && (
                  <div className="mt-16 md:mt-20 pt-12 md:pt-16 border-t border-outline-variant/30">
                    <h3 className="font-headline-lg text-3xl text-primary mb-8">Traveler Journals</h3>
                    <div className="space-y-8">
                      {posts.slice(0, 3).map((post) => (
                        <JournalEntry
                          key={post.id}
                          author={post.author}
                          text={post.description || post.title}
                          meta={(post.likesLabel || post.likes || '').replace(/^🔥\s*/, '').toUpperCase()}
                        />
                      ))}
                    </div>
                    {posts.length > 3 && (
                      <p className="mt-8 font-body-md text-secondary font-medium flex items-center gap-2">
                        {posts.length} posts from the community
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <aside className="lg:col-span-4 space-y-8">
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-2 shadow-[0px_4px_20px_rgba(44,44,44,0.03)] relative">
                  <div className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-secondary-container rounded-full flex items-center justify-center shadow-sm">
                    <span className="material-symbols-outlined text-on-secondary text-[16px]">map</span>
                  </div>
                  <div className="w-full h-[220px] md:h-[250px] bg-surface-container rounded-lg overflow-hidden relative">
                    {mapEmbedUrl && (
                      <iframe
                        title={`Map — ${place.name}`}
                        src={mapEmbedUrl}
                        className="absolute inset-0 w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    )}
                    <div className="absolute bottom-3 right-3 z-10">
                      <a
                        href={mapSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-primary/90 text-on-primary px-3 py-1.5 rounded-full font-body-md text-[12px] backdrop-blur-sm flex items-center gap-1.5 hover:bg-primary transition-colors shadow-md"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        Open in Maps
                      </a>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-headline-md text-[20px] text-primary mb-1">Getting Around</h4>
                    <p className="font-body-md text-[14px] text-on-surface-variant">{essentials.gettingAround}</p>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-[0px_4px_20px_rgba(44,44,44,0.03)]">
                  <h4 className="font-headline-md text-[24px] text-primary mb-6 border-b border-outline-variant pb-4">
                    Essential Knowledge
                  </h4>
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                      <span className="material-symbols-outlined text-secondary">wb_sunny</span>
                      <div>
                        <p className="font-body-md text-[14px] text-on-surface-variant font-bold mb-1">Best Time to Visit</p>
                        <p className="font-body-md text-[14px] text-on-surface-variant">{essentials.bestTime}</p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="material-symbols-outlined text-secondary">payments</span>
                      <div>
                        <p className="font-body-md text-[14px] text-on-surface-variant font-bold mb-1">Currency</p>
                        <p className="font-body-md text-[14px] text-on-surface-variant">
                          Malaysian Ringgit (MYR). Cash helps at markets and stalls.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-4">
                      <span className="material-symbols-outlined text-secondary">translate</span>
                      <div>
                        <p className="font-body-md text-[14px] text-on-surface-variant font-bold mb-1">Language</p>
                        <p className="font-body-md text-[14px] text-on-surface-variant">
                          Malay and English widely spoken; local dialects vary by state.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>

            <section className="pt-8 border-t border-outline-variant/30">
              <h2 className="font-headline-lg text-3xl md:text-4xl text-primary mb-8">Related posts</h2>
              {posts.length === 0 ? (
                <p className="text-on-surface-variant">No posts linked yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col group border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest"
                    >
                      <div className="aspect-[4/3] overflow-hidden">
                          <PlaceImage post={post} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      <div className="p-5">
                        <h3 className="font-headline-md text-primary mb-2 line-clamp-2">{post.title}</h3>
                        <p className="font-body-md text-sm text-on-surface-variant line-clamp-2 mb-4">
                          {post.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-label-caps text-[10px] text-on-surface-variant">
                            {(post.likesLabel || post.likes || '').replace(/^🔥\s*/, '').toUpperCase()}
                          </span>
                          {post.noteUrl && (
                            <a
                              href={post.noteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-label-caps text-[10px] text-secondary hover:text-primary"
                            >
                              View on RedNote
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>

      <SiteFooter />
    </div>
  )
}
