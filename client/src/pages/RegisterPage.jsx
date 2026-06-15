import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AuthModal, { AUTH_HERO_REGISTER } from '../components/AuthModal.jsx'
import PasswordField from '../components/PasswordField.jsx'
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.jsx'
import RegisterSocialButtons from '../components/RegisterSocialButtons.jsx'
import IdentitySetupOverlay from '../components/IdentitySetupOverlay.jsx'
import RegisterSuccessOverlay from '../components/RegisterSuccessOverlay.jsx'
import { DEFAULT_PREFERENCES } from '../constants/travelPreferences.js'
import { getPasswordStrength } from '../utils/passwordStrength.js'
import { isIdentityComplete } from '../utils/preferenceSuggestions.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  authCheckboxClass,
  authDividerLineClass,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../styles/authFormClasses.js'

export default function RegisterPage() {
  const location = useLocation()
  const { register, updatePreferences } = useAuth()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [setupStep, setSetupStep] = useState('account')
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES)
  const [identityError, setIdentityError] = useState(null)
  const [identitySubmitting, setIdentitySubmitting] = useState(false)

  const modalState = { background: location.state?.background, from: location.state?.from }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!termsAccepted) {
      setError('Please accept the Terms of Service and Privacy Policy.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    const { isStrongEnough } = getPasswordStrength(password)
    if (!isStrongEnough) {
      setError('Choose a stronger password (at least 8 characters with numbers or mixed case).')
      return
    }
    setError(null)
    setSubmitting(true)
    const username =
      email.split('@')[0]?.replace(/\W/g, '') || displayName.replace(/\s+/g, '').toLowerCase() || 'traveler'
    try {
      await register(
        { username, email, password, displayName: displayName.trim() || username },
        true,
      )
      setSetupStep('identity')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSaveIdentity() {
    if (!isIdentityComplete(preferences)) {
      setIdentityError('Please choose at least one option for Pace, Focus, and Dining.')
      return
    }
    setIdentityError(null)
    setIdentitySubmitting(true)
    try {
      await updatePreferences(preferences, true)
      setSetupStep('done')
    } catch (err) {
      setIdentityError(err.message)
    } finally {
      setIdentitySubmitting(false)
    }
  }

  return (
    <>
      {setupStep === 'account' && (
      <AuthModal
        imageAlt="Malaysian Cameron Highlands tea plantation"
        heroImage={AUTH_HERO_REGISTER}
        overlayTitle="Begin Your Journey"
        overlayDescription="Discover the quiet sophistication of Malaysia's hidden gems, curated for the discerning explorer. Your narrative starts here."
        showEditorialIcons
      >
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="font-headline-lg text-headline-lg text-primary tracking-tight">travelah</span>
          </Link>
          <h2 className="mt-6 font-headline-md text-headline-md text-on-surface">Create an account</h2>
          <p className="mt-2 font-body-md text-on-surface-variant">Join our community of global wanderers.</p>
        </div>

        <RegisterSocialButtons />

        <div className="relative flex items-center justify-center">
          <div className={`flex-grow ${authDividerLineClass}`} />
          <span className="px-4 font-label-caps text-label-caps text-on-surface-variant bg-background whitespace-nowrap">
            or sign up with email
          </span>
          <div className={`flex-grow ${authDividerLineClass}`} />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <p className="text-error font-body-md text-sm text-center bg-error-container/30 rounded-full py-2 px-4">
              {error}
            </p>
          )}

          <div>
            <label className={authLabelClass} htmlFor="fullName">
              Full Name
            </label>
            <input
              className={authInputClass}
              id="fullName"
              name="fullName"
              placeholder="Wau Bulan"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div>
            <label className={authLabelClass} htmlFor="email">
              Email Address
            </label>
            <input
              className={authInputClass}
              id="email"
              name="email"
              placeholder="explorer@travelah.my"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <PasswordField
              id="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              onToggleVisibility={() => setShowPassword((v) => !v)}
              minLength={8}
              required
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
            <PasswordStrengthIndicator
              password={password}
              visible={passwordFocused || password.length > 0}
            />
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword((v) => !v)}
            minLength={8}
            required
            autoComplete="new-password"
          />

          <div className="flex items-start gap-3 px-2">
            <input
              className={`${authCheckboxClass} mt-0.5`}
              id="terms"
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label className="font-body-md text-on-surface-variant text-sm" htmlFor="terms">
              I agree to the{' '}
              <span className="text-primary font-bold cursor-not-allowed">Terms of Service</span> and{' '}
              <span className="text-primary font-bold cursor-not-allowed">Privacy Policy</span>.
            </label>
          </div>

          <button className={authPrimaryBtnClass} type="submit" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="text-center">
          <p className="font-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link
              className="text-primary font-bold hover:underline ml-1"
              to="/login"
              state={modalState}
              replace
            >
              Log In
            </Link>
          </p>
        </div>
      </AuthModal>
      )}

      <IdentitySetupOverlay
        open={setupStep === 'identity'}
        preferences={preferences}
        onChange={setPreferences}
        onSubmit={handleSaveIdentity}
        submitting={identitySubmitting}
        error={identityError}
      />

      <RegisterSuccessOverlay open={setupStep === 'done'} />
    </>
  )
}
