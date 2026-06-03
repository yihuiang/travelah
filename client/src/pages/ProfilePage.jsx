import { useEffect, useState } from 'react'
import HeaderNav from '../components/HeaderNav.jsx'

const DEMO_USERNAME = 'esterling'

const LANGUAGE_OPTIONS = [
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'ms', label: 'Bahasa Melayu' },
  { value: 'zh-CN', label: 'Mandarin 中文' },
  { value: 'fr', label: 'Français' },
]

const CURRENCY_OPTIONS = [
  { value: 'MYR', label: 'MYR - Ringgit' },
  { value: 'USD', label: 'USD - Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
]

function formatMemberSince(dateStr) {
  if (!dateStr) return ''
  const year = new Date(dateStr).getFullYear()
  return `Member since ${year}`
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('travelah_token')
    const url = token ? '/api/profile/me' : `/api/profile/${DEMO_USERNAME}`
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    fetch(url, { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load profile')
        return res.json()
      })
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const preferences = profile?.preferences || {}
  const settings = profile?.settings || {}
  const savedItineraries = profile?.savedItineraries || []

  return (
    <div
      className="text-on-surface font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture"
      style={{ backgroundBlendMode: 'soft-light' }}
    >
      <HeaderNav />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-40 pb-24">
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-4">Profile</h1>
            <p className="font-body-lg text-on-surface-variant max-w-lg">
              Manage your personal preferences, review curated collections, and refine your next
              escape into quiet sophistication.
            </p>
          </div>
          {loading ? (
            <p className="font-body-md text-on-surface-variant">Loading profile…</p>
          ) : error ? (
            <p className="font-body-md text-error">{error}</p>
          ) : profile ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-outline-variant shadow-sm bg-surface-container-low">
                {profile.avatarUrl ? (
                  <img
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    src={profile.avatarUrl}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container text-primary font-headline-md">
                    {profile.displayName?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-headline-md text-on-background">{profile.displayName}</h2>
                <p className="font-label-caps text-on-surface-variant uppercase">
                  @{profile.username} · {formatMemberSince(profile.memberSince)}
                </p>
              </div>
            </div>
          ) : null}
        </header>

        {!loading && !error && profile && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter md:gap-12 items-start">
            <div className="lg:col-span-4 flex flex-col gap-8">
              <section className="bg-surface-container-lowest rounded border border-outline-variant shadow-magazine p-8 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute -right-4 -top-4 opacity-5 text-primary pointer-events-none">
                  <span
                    className="material-symbols-outlined text-[120px]"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    local_florist
                  </span>
                </div>
                <h3 className="font-headline-lg text-primary mb-6 relative z-10">Identity</h3>
                <div className="space-y-6 relative z-10">
                  {[
                    ['Pace', preferences.pace],
                    ['Focus', preferences.focus],
                    ['Dining', preferences.dining],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center border-b border-outline-variant/30 pb-4"
                    >
                      <span className="font-body-md text-on-surface">{label}</span>
                      <span className="font-label-caps text-secondary uppercase bg-surface-container py-1 px-3 rounded-full">
                        {value || '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-8 w-full border border-primary text-primary hover:bg-primary hover:text-on-primary rounded-full py-3 font-body-md transition-colors duration-200 text-center"
                >
                  Refine Profile
                </button>
              </section>

              <section className="bg-surface-container-lowest rounded border border-outline-variant shadow-magazine p-8">
                <h3 className="font-headline-md text-primary mb-6">Settings</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-caps text-on-surface-variant uppercase">Language</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-surface border border-outline-variant rounded-full py-3 px-6 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                        value={settings.language || 'en-GB'}
                        readOnly
                        disabled
                      >
                        {LANGUAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <label className="font-label-caps text-on-surface-variant uppercase">Currency</label>
                    <div className="relative">
                      <select
                        className="w-full appearance-none bg-surface border border-outline-variant rounded-full py-3 px-6 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
                        value={settings.currency || 'MYR'}
                        readOnly
                        disabled
                      >
                        {CURRENCY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>
                  <div className="pt-6">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-error hover:text-error-container transition-colors font-body-md"
                      onClick={() => {
                        localStorage.removeItem('travelah_token')
                        window.location.reload()
                      }}
                    >
                      <span className="material-symbols-outlined">logout</span> Sign Out
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-8" id="collections">
              <div className="flex justify-between items-end mb-8">
                <h2 className="font-headline-lg text-primary relative">Curated Collections</h2>
                <button
                  type="button"
                  className="font-label-caps text-on-surface-variant uppercase hover:text-primary transition-colors flex items-center gap-1"
                >
                  View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
              {savedItineraries.length === 0 ? (
                <p className="font-body-md text-on-surface-variant">No saved itineraries yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {savedItineraries.map((item) => (
                    <article
                      key={item.title}
                      className={`group cursor-pointer ${item.offset ? 'md:mt-12' : ''}`}
                    >
                      <div className="relative aspect-[3/4] rounded overflow-hidden border border-outline-variant mb-6 shadow-magazine">
                        <img
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={item.image}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm p-2 rounded-full text-primary">
                          <span
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                          >
                            bookmark
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="font-label-caps text-secondary uppercase mb-2">{item.location}</p>
                        <h3 className="font-headline-md text-on-background mb-2 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="font-body-md text-on-surface-variant line-clamp-2">{item.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-surface-container-low w-full rounded-t-lg border-t border-outline-variant px-margin-mobile md:px-margin-desktop py-16 flex flex-col items-center text-center gap-unit mt-auto">
        <div className="font-headline-lg text-primary mb-4">travelah</div>
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {['Destinations', 'Heritage', 'Culture', 'Sustainability', 'Contact', 'Privacy'].map(
            (link) => (
              <a
                key={link}
                className="text-on-surface-variant hover:text-secondary transition-colors opacity-80 hover:opacity-100"
                href="#"
              >
                {link}
              </a>
            ),
          )}
        </div>
        <p className="text-on-surface-variant opacity-80">
          © {new Date().getFullYear()} travelah. Crafted for the discerning explorer.
        </p>
      </footer>
    </div>
  )
}
