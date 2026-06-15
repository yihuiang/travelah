/** RedNote CDN links expire and block direct browser hotlinking. */

export function isRedNoteCdn(url) {
  return typeof url === 'string' && /rednotecdn\.com/i.test(url)
}

function extractXhsFileId(url) {
  if (!url) return null
  const match = String(url).match(/\/(1040g[^/!\?]+)/i)
  return match ? match[1] : null
}

/** Map rednotecdn cover URLs to xhscdn mirrors that still load in the browser. */
export function resolveXhsImageUrl(imageUrl, { videoUrl } = {}) {
  if (!imageUrl && !videoUrl) return null
  if (imageUrl && !isRedNoteCdn(imageUrl)) return imageUrl

  const fileId = extractXhsFileId(imageUrl) || extractXhsFileId(videoUrl)
  if (fileId) return `https://sns-img-bd.xhscdn.com/${fileId}`

  return imageUrl || null
}

/** Display URL for a post — prefers local cache, then xhscdn mirror, then API fallback. */
export function getPostImageUrl(post) {
  if (!post) return null
  if (post.imageLocal) return post.imageLocal

  const resolved = resolveXhsImageUrl(post.image, { videoUrl: post.videoUrl })
  if (resolved) return resolved

  const id = post.id || post.postId
  if (id && post.image) return `/api/posts/${id}/image`
  return null
}

/** Display URL for place cover images. */
export function getPlaceImageUrl(coverImage) {
  if (!coverImage) return null

  let url = coverImage
  if (!/^https?:\/\//i.test(url) && !url.startsWith('/')) {
    url = `/${url.replace(/^\/+/, '')}`
  }

  if (!isRedNoteCdn(url)) return url
  return resolveXhsImageUrl(url)
}
