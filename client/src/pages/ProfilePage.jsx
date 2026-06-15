import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import HomeTopNav from '../components/home/HomeTopNav.jsx'
import IdentitySetupOverlay from '../components/IdentitySetupOverlay.jsx'
import ProfileEditView from '../components/ProfileEditView.jsx'
import { normalizePreferences } from '../constants/travelPreferences.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatPreferencesForDisplay, isIdentityComplete } from '../utils/preferenceSuggestions.js'
import '../styles/home-v2.css'
import '../styles/profile-v2.css'

const LANGUAGE_OPTIONS = [
  { value: 'en-GB', label: 'English' },
  { value: 'ms', label: 'Bahasa Melayu' },
  { value: 'zh-CN', label: '中文 Mandarin' },
]

const CURRENCY_OPTIONS = [
  { value: 'MYR', label: 'MYR — Ringgit Malaysia' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
]

const STATS = [
  { value: '3', label: 'Trips planned' },
  { value: '5', label: 'States visited' },
  { value: '42', label: 'Places saved' },
  { value: '14', label: 'Nights booked' },
]

const SAVED_PLACES = [
  {
    id: 'penang',
    href: '/itinerary',
    offset: false,
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=600&q=80',
    loc: 'Penang',
    name: 'George Town Street Art',
    desc: 'Murals, clan jetties, kopitiam culture — the one that keeps coming up in every RedNote post.',
  },
  {
    id: 'melaka',
    href: '/explore',
    offset: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
    loc: 'Melaka',
    name: 'Jonker Street Night Market',
    desc: 'Weekend market in a UNESCO zone. Cendol, antiques, popiah. RM5 and you\'re full.',
  },
  {
    id: 'sipadan',
    href: '/explore',
    offset: false,
    image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&w=600&q=80',
    loc: 'Sabah',
    name: 'Sipadan Island',
    desc: '40-diver daily limit. Hammerheads, turtles, a 600m wall drop. Apply for permit 6 months early.',
  },
  {
    id: 'taman-negara',
    href: '/explore',
    offset: true,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
    loc: 'Pahang',
    name: 'Taman Negara Rainforest',
    desc: '130 million years old. Canopy walk, night trek, river cruise. Zero phone signal — in a good way.',
  },
]

const RECENT_ACTIVITY = [
  {
    icon: 'auto_awesome',
    action: 'Generated itinerary — 5 Days in Penang',
    dest: 'Culture & Heritage · Relaxed · Mid-range',
    time: '2 days ago',
  },
  {
    icon: 'bookmark',
    action: 'Saved Sipadan Island to collections',
    dest: 'Sabah · Adventure · Diving',
    time: '4 days ago',
  },
  {
    icon: 'luggage',
    action: 'Planned Melaka Weekend trip',
    dest: 'Feb 14–16, 2026 · 3 nights',
    time: '1 week ago',
  },
  {
    icon: 'search',
    action: 'Searched Sabah rainforest hikes',
    dest: 'Explore · Nature & Adventure',
    time: '1 week ago',
  },
  {
    icon: 'bookmark',
    action: 'Saved Taman Negara to collections',
    dest: 'Pahang · Nature · Hidden Gem',
    time: '2 weeks ago',
  },
]

const MAX_AVATAR_BYTES = 2 * 1024 * 1024

function firstName(profile, user) {
  const raw = profile?.displayName || user?.displayName || user?.username || 'Traveler'
  return raw.split(' ')[0]
}

function avatarInitial(profile, user) {
  const raw = profile?.displayName || user?.displayName || user?.username || '?'
  return raw.charAt(0).toUpperCase()
}

export default function ProfilePage() {
  const { isAuthenticated, token, logout, updatePreferences, updateProfile, uploadAvatar, removeAvatar, user } =
    useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingIdentity, setEditingIdentity] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editPreferences, setEditPreferences] = useState(() => normalizePreferences({}))
  const [identityError, setIdentityError] = useState(null)
  const [identitySubmitting, setIdentitySubmitting] = useState(false)
  const [profileEditError, setProfileEditError] = useState(null)
  const [passwordEditError, setPasswordEditError] = useState(null)
  const [avatarEditError, setAvatarEditError] = useState(null)
  const [personalSubmitting, setPersonalSubmitting] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setLoading(false)
      return
    }

    fetch('/api/profile/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (res.status === 401 || res.status === 404) {
          logout()
          throw new Error(
            res.status === 404
              ? 'Your account was not found. Please sign in again.'
              : 'Your session expired. Please sign in again.',
          )
        }
        if (!res.ok) {
          throw new Error(data.error || 'Could not load profile')
        }
        return data
      })
      .then(setProfile)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAuthenticated, token, logout])

  const preferences = useMemo(
    () => formatPreferencesForDisplay(profile?.preferences),
    [profile?.preferences],
  )

  const settings = profile?.settings || {}
  const displayName = firstName(profile, user)

  const savedPlaces = useMemo(() => {
    const items = profile?.savedItineraries || []
    if (items.length === 0) return SAVED_PLACES
    return items.map((item, index) => ({
      id: item.title,
      href: '/itinerary',
      offset: item.offset ?? index % 2 === 1,
      image: item.image,
      loc: item.location?.split(',')[0] || item.location,
      name: item.title,
      desc: item.description,
    }))
  }, [profile?.savedItineraries])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: { pathname: '/profile' }, background: { pathname: '/' } }} replace />
  }

  function openIdentityEditor() {
    setEditPreferences(normalizePreferences(profile?.preferences))
    setIdentityError(null)
    setEditingIdentity(true)
  }

  function closeIdentityEditor() {
    if (!identitySubmitting) {
      setEditingIdentity(false)
      setIdentityError(null)
    }
  }

  function openProfileEditor() {
    setProfileEditError(null)
    setPasswordEditError(null)
    setAvatarEditError(null)
    setEditingProfile(true)
  }

  function closeProfileEditor() {
    if (!personalSubmitting && !passwordSubmitting && !avatarUploading) {
      setEditingProfile(false)
      setProfileEditError(null)
      setPasswordEditError(null)
      setAvatarEditError(null)
    }
  }

  async function handleUploadAvatar(file) {
    setAvatarEditError(null)
    setAvatarUploading(true)
    try {
      if (file.size > MAX_AVATAR_BYTES) {
        throw new Error('Image must be 2 MB or smaller.')
      }
      const updated = await uploadAvatar(file, true)
      setProfile(updated)
    } catch (err) {
      setAvatarEditError(err.message)
      throw err
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleRemoveAvatar() {
    if (!profile?.avatarUrl) return
    setAvatarEditError(null)
    setAvatarUploading(true)
    try {
      const updated = await removeAvatar(true)
      setProfile(updated)
    } catch (err) {
      setAvatarEditError(err.message)
      throw err
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSaveIdentity() {
    if (!isIdentityComplete(editPreferences)) {
      setIdentityError('Please choose at least one option for Pace, Focus, and Dining.')
      return
    }
    setIdentityError(null)
    setIdentitySubmitting(true)
    try {
      const updated = await updatePreferences(editPreferences, true)
      setProfile((prev) =>
        prev ? { ...prev, preferences: updated.preferences ?? editPreferences } : prev,
      )
      setEditingIdentity(false)
    } catch (err) {
      setIdentityError(err.message)
    } finally {
      setIdentitySubmitting(false)
    }
  }

  async function handleSavePersonal(payload) {
    setProfileEditError(null)
    setPersonalSubmitting(true)
    try {
      const nameOrEmailChanged =
        payload.displayName !== profile?.displayName ||
        payload.email !== (profile?.email || '')

      if (!nameOrEmailChanged) return

      const updated = await updateProfile(
        { displayName: payload.displayName, email: payload.email },
        true,
      )
      setProfile(updated)
    } catch (err) {
      setProfileEditError(err.message)
    } finally {
      setPersonalSubmitting(false)
    }
  }

  async function handleSavePassword(payload) {
    if (payload.validationError) {
      setPasswordEditError(payload.validationError)
      return
    }
    if (!payload.newPassword) {
      setPasswordEditError('Enter a new password.')
      return
    }
    if (!payload.currentPassword) {
      setPasswordEditError('Enter your current password.')
      return
    }

    setPasswordEditError(null)
    setPasswordSubmitting(true)
    try {
      const updated = await updateProfile(
        {
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
        },
        true,
      )
      setProfile(updated)
    } catch (err) {
      setPasswordEditError(err.message)
    } finally {
      setPasswordSubmitting(false)
    }
  }

  return (
    <div className="home-v2 profile-v2 min-h-screen flex flex-col">
      <HomeTopNav activePage="profile" />

      {editingProfile && profile ? (
        <div className="profile-edit-wrap">
          <button
            type="button"
            className="btn-back-profile"
            onClick={closeProfileEditor}
            disabled={personalSubmitting || passwordSubmitting || avatarUploading}
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to profile
          </button>
          <ProfileEditView
            profile={profile}
            onSavePersonal={handleSavePersonal}
            onSavePassword={handleSavePassword}
            onUploadAvatar={handleUploadAvatar}
            onRemoveAvatar={handleRemoveAvatar}
            personalSubmitting={personalSubmitting}
            passwordSubmitting={passwordSubmitting}
            avatarUploading={avatarUploading}
            personalError={profileEditError}
            passwordError={passwordEditError}
            avatarError={avatarEditError}
          />
        </div>
      ) : (
        <>
          <div className="profile-hero">
            <div className="profile-hero-inner">
              <div>
                <div className="hero-eyebrow">
                  <div className="hero-eyebrow-dot" />
                  <span className="hero-eyebrow-text">Account settings</span>
                </div>
                <h1 className="hero-headline">
                  Your
                  <br />
                  <em>profile.</em>
                </h1>
                <p className="hero-sub">
                  Manage your travel identity, preferences, and saved collections — all in one place.
                </p>
              </div>
              {profile && (
                <div className="avatar-card">
                  <div className="avatar-ring">
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt={profile.displayName} />
                    ) : (
                      avatarInitial(profile, user)
                    )}
                  </div>
                  <div>
                    <p className="avatar-name">{profile.displayName || displayName}</p>
                    <p className="avatar-handle">{profile.email || 'No email set'}</p>
                  </div>
                  <span className="avatar-tier">
                    <span className="material-symbols-outlined">workspace_premium</span> Explorer
                  </span>
                  <button type="button" className="btn-edit-avatar" onClick={openProfileEditor}>
                    <span className="material-symbols-outlined">edit</span> Edit
                  </button>
                </div>
              )}
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

          {loading && <p className="profile-loading">Loading profile…</p>}
          {error && <p className="profile-error">{error}</p>}

          {!loading && !error && profile && (
            <main className="profile-wrap">
              <aside className="sidebar">
                <div className="card nav-card">
                  <h2 className="card-title">Account</h2>
                  <Link to="/trips">
                    <span className="material-symbols-outlined">luggage</span> My Trips
                    <span className="material-symbols-outlined nav-arrow">chevron_right</span>
                  </Link>
                  <a href="#collections">
                    <span className="material-symbols-outlined">bookmark</span> Saved Places
                    <span className="material-symbols-outlined nav-arrow">chevron_right</span>
                  </a>
                  <a href="#activity">
                    <span className="material-symbols-outlined">history</span> Recent Activity
                    <span className="material-symbols-outlined nav-arrow">chevron_right</span>
                  </a>
                  <Link to="/plan">
                    <span className="material-symbols-outlined">auto_awesome</span> Plan a Trip
                    <span className="material-symbols-outlined nav-arrow">chevron_right</span>
                  </Link>
                </div>

                <div className="card">
                  <span className="material-symbols-outlined card-watermark">local_florist</span>
                  <h2 className="card-title">Travel Identity</h2>
                  <div className="identity-row">
                    <span className="identity-key">Pace</span>
                    <span className="identity-val">{preferences.pace}</span>
                  </div>
                  <div className="identity-row">
                    <span className="identity-key">Focus</span>
                    <span className="identity-val">{preferences.focus}</span>
                  </div>
                  <div className="identity-row">
                    <span className="identity-key">Dining</span>
                    <span className="identity-val">{preferences.dining}</span>
                  </div>
                  <div className="identity-row">
                    <span className="identity-key">Budget</span>
                    <span className="identity-val">Mid-range</span>
                  </div>
                  <button type="button" className="btn-outline-full" onClick={openIdentityEditor}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      tune
                    </span>
                    Refine preferences
                  </button>
                </div>

                <div className="card">
                  <h2 className="card-title">Settings</h2>
                  <label className="field-label" htmlFor="profile-language">
                    Language
                  </label>
                  <div className="field-select-wrap">
                    <select
                      id="profile-language"
                      className="field-select"
                      value={settings.language || 'en-GB'}
                      disabled
                    >
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                  <label className="field-label" htmlFor="profile-currency">
                    Currency
                  </label>
                  <div className="field-select-wrap">
                    <select
                      id="profile-currency"
                      className="field-select"
                      value={settings.currency || 'MYR'}
                      disabled
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                  <label className="field-label" htmlFor="profile-notifications">
                    Notifications
                  </label>
                  <div className="field-select-wrap">
                    <select id="profile-notifications" className="field-select" disabled defaultValue="reminders">
                      <option value="reminders">Trip reminders only</option>
                      <option value="all">All updates</option>
                      <option value="none">None</option>
                    </select>
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                  <button type="button" className="btn-signout" onClick={logout}>
                    <span className="material-symbols-outlined">logout</span> Sign out
                  </button>
                </div>
              </aside>

              <div className="right-content">
                <section id="collections">
                  <div className="section-head">
                    <div>
                      <p className="section-eyebrow">Bookmarked from Explore</p>
                      <h2 className="section-title">Saved Places</h2>
                    </div>
                    <Link to="/explore" className="view-all">
                      Browse more <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                    </Link>
                  </div>
                  <div className="collections-grid">
                    {savedPlaces.map((place) => (
                      <Link
                        key={place.id}
                        to={place.href}
                        className={`collection-card${place.offset ? ' offset' : ''}`}
                      >
                        <div className="col-img-wrap">
                          <img src={place.image} alt={place.name} />
                          <span className="col-bookmark">
                            <span className="material-symbols-outlined">bookmark</span>
                          </span>
                        </div>
                        <p className="col-loc">{place.loc}</p>
                        <h3 className="col-name">{place.name}</h3>
                        <p className="col-desc">{place.desc}</p>
                      </Link>
                    ))}
                  </div>
                </section>

                <section id="activity">
                  <div className="section-head">
                    <div>
                      <p className="section-eyebrow">What you&apos;ve been up to</p>
                      <h2 className="section-title">Recent Activity</h2>
                    </div>
                  </div>
                  <div className="activity-list">
                    {RECENT_ACTIVITY.map((item) => (
                      <div key={item.action} className="activity-item">
                        <div className="activity-icon-wrap">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div className="activity-body">
                          <p className="activity-action">{item.action}</p>
                          <p className="activity-dest">{item.dest}</p>
                        </div>
                        <span className="activity-time">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="section-head">
                    <div>
                      <p className="section-eyebrow">Irreversible actions</p>
                      <h2 className="section-title">Account</h2>
                    </div>
                  </div>
                  <div className="danger-card">
                    <h3 className="danger-title">Delete account</h3>
                    <p className="danger-sub">
                      This permanently removes your profile, all saved trips, collections, and preferences.
                      There&apos;s no way to undo this.
                    </p>
                    <button type="button" className="btn-danger">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        delete
                      </span>
                      Delete my account
                    </button>
                  </div>
                </section>
              </div>
            </main>
          )}
        </>
      )}

      <footer className="profile-footer">
        <div className="profile-footer-inner">
          <Link to="/" className="profile-footer-logo">
            travelah
          </Link>
          <ul className="profile-footer-nav">
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
          <span className="profile-footer-copy">© {new Date().getFullYear()} travelah</span>
        </div>
      </footer>

      <IdentitySetupOverlay
        open={editingIdentity}
        variant="edit"
        preferences={editPreferences}
        onChange={setEditPreferences}
        onSubmit={handleSaveIdentity}
        submitting={identitySubmitting}
        error={identityError}
        username={profile?.username || user?.username}
        onClose={closeIdentityEditor}
      />
    </div>
  )
}
