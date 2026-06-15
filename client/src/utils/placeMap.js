/** Known coordinates for curated places (more accurate than name search). */
const KNOWN_COORDS = {
  'hounon ridge farmstay': { lat: 6.0083, lng: 116.5472 },
  kundasang: { lat: 6.025, lng: 116.562 },
  '半山芭巴刹': { lat: 3.1372, lng: 101.6974 },
}

function normalizeKey(name) {
  return (name || '').trim().toLowerCase()
}

export function getMapSearchQuery(place) {
  return `${place.name}, ${place.state || 'Malaysia'}, Malaysia`
}

export function getMapSearchUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMapSearchQuery(place))}`
}

/** Google Maps embed URL — works without an API key for FYP/demo use. */
export function getMapEmbedUrl(place) {
  if (place?.lat != null && place?.lng != null) {
    return `https://maps.google.com/maps?q=${place.lat},${place.lng}&hl=en&z=15&output=embed`
  }

  const known = KNOWN_COORDS[normalizeKey(place?.name)]
  if (known) {
    return `https://maps.google.com/maps?q=${known.lat},${known.lng}&hl=en&z=15&output=embed`
  }

  const q = encodeURIComponent(getMapSearchQuery(place))
  return `https://maps.google.com/maps?q=${q}&hl=en&z=14&output=embed`
}
