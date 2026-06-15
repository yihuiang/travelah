import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RegisterSuccessOverlay({ open, onDiscover }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!open) return null

  const welcomeName = user?.username || user?.displayName || 'traveler'

  return (
    <div className="fixed inset-0 z-[110] bg-primary/20 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-surface p-8 md:p-12 rounded-lg max-w-sm w-full text-center shadow-2xl border border-outline-variant">
        <div className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[32px]">check</span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome {welcomeName}</h3>
        <p className="font-body-md text-on-surface-variant mb-8">
          Your profile is being prepared for the journey of a lifetime.
        </p>
        <button
          type="button"
          className="w-full py-3 rounded-full bg-primary text-on-primary font-bold transition-transform active:scale-95"
          onClick={() => {
            onDiscover?.()
            navigate('/explore', { replace: true })
          }}
        >
          Take me to Discover
        </button>
        <div className="w-12 h-1 bg-outline-variant/30 rounded-full mx-auto mt-6 animate-pulse" />
      </div>
    </div>
  )
}
