import {
  DINING_OPTIONS,
  FOCUS_OPTIONS,
  PACE_OPTIONS,
  normalizePreferenceList,
} from '../constants/travelPreferences.js'

const chipBase =
  'px-4 py-2.5 rounded-full border font-body-md text-[14px] transition-all duration-200'

const chipSelected =
  'border-primary bg-primary text-on-primary shadow-[0px_2px_12px_rgba(92,30,5,0.12)]'

const chipDefault =
  'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:border-primary/50 hover:text-primary'

function MultiSelectGroup({ label, options, selected, onChange }) {
  const values = normalizePreferenceList(selected)

  function toggle(option) {
    const next = values.includes(option)
      ? values.filter((v) => v !== option)
      : [...values, option]
    onChange(next)
  }

  return (
    <div className="border-b border-outline-variant/30 pb-5 last:border-0 last:pb-0">
      <p className="font-headline-md text-xl md:text-2xl text-on-surface mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option)
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              className={`${chipBase} ${active ? chipSelected : chipDefault}`}
              onClick={() => toggle(option)}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function IdentityPreferencesForm({ preferences, onChange, onSubmit, submitting, error }) {
  return (
    <section className="bg-surface-container-lowest rounded border border-outline-variant shadow-magazine p-8 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-5 text-primary pointer-events-none">
        <span
          className="material-symbols-outlined text-[120px]"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          local_florist
        </span>
      </div>

      <h3 className="font-headline-lg text-3xl md:text-4xl text-primary mb-2 relative z-10">Identity</h3>
      <p className="font-body-md text-on-surface-variant text-sm mb-6 relative z-10">
        Tell us how you travel so we can suggest the right experiences. Select all that apply.
      </p>

      {error && (
        <p className="text-error font-body-md text-sm text-center bg-error-container/30 rounded-full py-2 px-4 mb-4 relative z-10">
          {error}
        </p>
      )}

      <div className="space-y-6 relative z-10">
        <MultiSelectGroup
          label="Pace"
          options={PACE_OPTIONS}
          selected={preferences.pace}
          onChange={(pace) => onChange({ ...preferences, pace })}
        />
        <MultiSelectGroup
          label="Focus"
          options={FOCUS_OPTIONS}
          selected={preferences.focus}
          onChange={(focus) => onChange({ ...preferences, focus })}
        />
        <MultiSelectGroup
          label="Dining"
          options={DINING_OPTIONS}
          selected={preferences.dining}
          onChange={(dining) => onChange({ ...preferences, dining })}
        />
      </div>

      <button
        type="button"
        className="mt-8 w-full border border-primary text-primary hover:bg-primary hover:text-on-primary rounded-full py-3 font-body-md transition-colors duration-200 text-center disabled:opacity-60 relative z-10"
        disabled={submitting}
        onClick={onSubmit}
      >
        {submitting ? 'Saving…' : 'Refine Profile'}
      </button>
    </section>
  )
}
