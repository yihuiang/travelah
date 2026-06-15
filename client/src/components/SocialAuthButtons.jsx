import GoogleIcon from './icons/GoogleIcon.jsx'
import { authSocialBtnFullClass } from '../styles/authFormClasses.js'

export default function SocialAuthButtons({ mode = 'signin' }) {
  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'

  return (
    <button type="button" disabled className={authSocialBtnFullClass} aria-label={label}>
      <GoogleIcon />
      <span>{label}</span>
    </button>
  )
}
