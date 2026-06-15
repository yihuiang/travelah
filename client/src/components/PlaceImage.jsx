import { useState } from 'react'
import { getPlaceImageUrl, getPostImageUrl } from '../utils/resolveImage.js'

export default function PlaceImage({ src, post, fallbackSrc, alt, className }) {
  const [failed, setFailed] = useState(false)
  const resolved = failed ? null : src || (post ? getPostImageUrl(post) : getPlaceImageUrl(fallbackSrc) || fallbackSrc)

  if (!resolved) {
    return (
      <div className={`bg-surface-container flex items-center justify-center ${className || ''}`}>
        <span className="material-symbols-outlined text-primary/30 text-5xl">photo_camera</span>
      </div>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
