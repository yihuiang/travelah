import { getPasswordStrength } from '../utils/passwordStrength.js'

export default function PasswordStrengthIndicator({ password, visible }) {
  const { percent, label, isStrongEnough } = getPasswordStrength(password)

  if (!visible && !password) return null

  const displayPercent = password ? percent : 0
  const displayLabel = password ? label : '—'

  return (
    <div className="mt-3 px-2 space-y-2" aria-live="polite">
      <div className="h-1.5 w-full rounded-full bg-primary/15 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            isStrongEnough ? 'bg-primary' : 'bg-secondary'
          }`}
          style={{ width: `${displayPercent}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-label-caps text-label-caps text-primary tracking-widest">
          STRENGTH: {displayLabel}
        </p>
        {password && (
          <p
            className={`font-body-md text-sm ${
              isStrongEnough ? 'text-primary font-medium' : 'text-on-surface-variant'
            }`}
          >
            {isStrongEnough ? 'Strong enough' : 'Keep going — add length, numbers, or symbols'}
          </p>
        )}
      </div>
    </div>
  )
}
