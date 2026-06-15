import { useAuth } from '../context/AuthContext.jsx'
import IdentityPreferencesForm from './IdentityPreferencesForm.jsx'

export default function IdentitySetupOverlay({
  open,
  preferences,
  onChange,
  onSubmit,
  submitting,
  error,
  username,
  variant = 'onboarding',
  onClose,
}) {
  const { user } = useAuth()
  const name = username || user?.username || user?.displayName
  const isEdit = variant === 'edit'

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[105] bg-primary/20 backdrop-blur-md flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="identity-setup-title"
      onClick={onClose ? (e) => e.target === e.currentTarget && onClose() : undefined}
    >
      <div className="bg-background p-6 md:p-8 rounded-[2rem] max-w-md w-full shadow-2xl border border-outline-variant max-h-[92vh] overflow-y-auto relative">
        {onClose && (
          <button
            type="button"
            className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            aria-label="Close"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        <div className="text-center mb-6">
          <p className="font-headline-md text-2xl text-primary tracking-tight">travelah</p>
          <h2 id="identity-setup-title" className="font-headline-md text-headline-md text-on-surface mt-4">
            {isEdit ? 'Your identity' : `Welcome${name ? `, ${name}` : ''}`}
          </h2>
          <p className="font-body-md text-on-surface-variant text-sm mt-2">
            {isEdit
              ? 'Update how you travel so we can refine your suggestions.'
              : 'One more step — shape your travel identity.'}
          </p>
        </div>
        <IdentityPreferencesForm
          preferences={preferences}
          onChange={onChange}
          onSubmit={onSubmit}
          submitting={submitting}
          error={error}
        />
      </div>
    </div>
  )
}
