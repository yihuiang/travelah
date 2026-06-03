import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

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

  return (
    <div className="text-on-surface font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture relative overflow-x-hidden">
      <HeaderNav activePage="explore" />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-40 pb-20 z-10 relative">
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
            <header className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div>
                <p className="font-label-caps text-secondary uppercase mb-2">{place.state}</p>
                <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-4">{place.name}</h1>
                <p className="font-body-lg text-on-surface-variant line-clamp-3">{place.description}</p>
                <div className="flex flex-wrap gap-3 mt-6">
                  <span className="font-label-caps text-[10px] px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40">
                    {(place.likesLabel || '').replace(/^🔥\s*/, '').toUpperCase()}
                  </span>
                  <span className="font-label-caps text-[10px] px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40">
                    {place.postCount} RELATED POSTS
                  </span>
                </div>
              </div>
              {place.coverImage && (
                <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-outline-variant shadow-magazine">
                  <img src={place.coverImage} alt={place.name} className="w-full h-full object-cover" />
                </div>
              )}
            </header>

            <section>
              <h2 className="font-headline-lg text-primary mb-8">Related posts</h2>
              {posts.length === 0 ? (
                <p className="text-on-surface-variant">No posts linked yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => (
                    <article key={post.id} className="flex flex-col group border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest">
                      {post.image && (
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
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
