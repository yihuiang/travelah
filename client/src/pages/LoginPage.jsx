import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthModal from '../components/AuthModal.jsx'
import SocialAuthButtons from '../components/SocialAuthButtons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  authCheckboxClass,
  authDividerLineClass,
  authInputClass,
  authLabelClass,
  authPrimaryBtnClass,
} from '../styles/authFormClasses.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const from = location.state?.from?.pathname || '/profile'
  const modalState = { background: location.state?.background, from: location.state?.from }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password, remember)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthModal imageAlt="Batu Caves, Malaysia">
      <div className="text-center space-y-2 mb-8">
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">travelah</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Welcome back. Please enter your details.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p className="text-error font-body-md text-center bg-error-container/30 rounded-full py-2 px-4">
            {error}
          </p>
        )}

        <div>
          <label className={authLabelClass} htmlFor="email">
            Email Address
          </label>
          <input
            className={authInputClass}
            id="email"
            name="email"
            placeholder="name@example.com"
            required
            type="text"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className={authLabelClass} htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              className={`${authInputClass} pr-12`}
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              className={authCheckboxClass}
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="font-body-md text-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">
              Remember me
            </span>
          </label>
          <span className="font-body-md text-body-md text-primary underline decoration-1 underline-offset-4 cursor-not-allowed opacity-70">
            Forgot Password?
          </span>
        </div>

        <button className={authPrimaryBtnClass} type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <div className="relative py-3">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full ${authDividerLineClass}`} />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 font-label-caps text-label-caps text-on-surface-variant">
            OR CONTINUE WITH
          </span>
        </div>
      </div>

      <SocialAuthButtons mode="signin" />

      <div className="text-center pt-3">
        <Link
          className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center justify-center gap-2 group"
          to="/explore"
          replace
        >
          Continue as Guest
          <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>

      <div className="text-center pt-5">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link
            className="text-primary font-bold hover:text-secondary transition-colors underline decoration-1 underline-offset-4"
            to="/register"
            state={modalState}
            replace
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthModal>
  )
}
