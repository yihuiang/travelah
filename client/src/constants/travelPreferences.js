export const PACE_OPTIONS = ['Leisurely', 'Balanced', 'Active']

export const FOCUS_OPTIONS = ['Heritage', 'Nature', 'Urban', 'Beach & Islands']

export const DINING_OPTIONS = ['Culinary Arts', 'Local Street Food', 'Fine Dining', 'Casual']

export const DEFAULT_PREFERENCES = {
  pace: [],
  focus: [],
  dining: [],
}

/** Normalize legacy string values from older accounts */
export function normalizePreferenceList(value) {
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return []
}

export function normalizePreferences(preferences) {
  return {
    pace: normalizePreferenceList(preferences?.pace),
    focus: normalizePreferenceList(preferences?.focus),
    dining: normalizePreferenceList(preferences?.dining),
  }
}
