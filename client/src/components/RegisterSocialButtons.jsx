import GoogleIcon from './icons/GoogleIcon.jsx'
import { authSocialBtnFullClass } from '../styles/authFormClasses.js'

export default function RegisterSocialButtons() {
  return (
    <button type="button" disabled className={authSocialBtnFullClass} aria-label="Sign up with Google">
      <GoogleIcon />
      <span>Google</span>
    </button>
  )
}
