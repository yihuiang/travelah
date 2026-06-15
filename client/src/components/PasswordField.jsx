import { useState } from 'react'
import { authInputClass, authLabelClass } from '../styles/authFormClasses.js'

export default function PasswordField({
  id,
  label,
  value,
  onChange,
  showPassword: controlledShow,
  onToggleVisibility,
  autoComplete = 'new-password',
  placeholder = '••••••••',
  minLength,
  required = false,
  disabled = false,
  onFocus,
  onBlur,
}) {
  const [internalShow, setInternalShow] = useState(false)
  const showPassword = controlledShow ?? internalShow
  const toggle =
    onToggleVisibility ??
    (() => {
      setInternalShow((v) => !v)
    })

  return (
    <div>
      <label className={authLabelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          className={`${authInputClass} pr-12`}
          id={id}
          name={id}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
        />
        <button
          className="absolute right-6 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50"
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={toggle}
          disabled={disabled}
          tabIndex={-1}
        >
          <span className="material-symbols-outlined text-[20px]">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>
    </div>
  )
}
