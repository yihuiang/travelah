import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { getPostImageUrl } from '../utils/resolveImage.js'

const BENTO_CLASSES = ['bento-card-a', 'bento-card-b', 'bento-card-c', 'bento-card-d', 'bento-card-e']

function formatCategory(item) {
  const raw = item?.category || item?.categories?.[0] || 'Culture'
  return String(raw).replace(/_/g, ' ')
}

function formatSource(item) {
  if (item?.sourceLabel) return item.sourceLabel
  if (item?.platform === 'xhs') return 'via RedNote'
  if (item?.platform === 'dy') return 'via TikTok'
  if (item?.likesLabel) return `${item.likesLabel} likes`
  return 'via social'
}

function TrendingCard({ item, rank, featured = false }) {
  const rankLabel = String(rank).padStart(2, '0')
  const imageSrc = getPostImageUrl(item)
  const CardWrapper = item.noteUrl ? 'a' : 'article'
  const wrapperProps = item.noteUrl
    ? { href: item.noteUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  if (featured) {
    return (
      <CardWrapper
        {...wrapperProps}
        className="md:col-span-7 group cursor-pointer block"
      >
        <div className="relative overflow-hidden aspect-[4/5] md:aspect-[3/4] rounded-lg mb-6 shadow-[0px_4px_20px_rgba(44,44,44,0.05)]">
          {imageSrc ? (
            <img
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={imageSrc}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-surface-container" />
          )}
          <div className="absolute top-8 left-8 bg-surface/90 backdrop-blur-sm px-4 py-2 rounded-full">
            <span className="font-label-caps text-primary">{rankLabel}</span>
          </div>
          {item.noteUrl && (
            <div className="absolute bottom-8 right-8">
              <div className="bg-primary text-on-primary p-4 rounded-full shadow-lg">
                <span className="material-symbols-outlined">share</span>
              </div>
            </div>
          )}
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-2 line-clamp-2">{item.title}</h3>
        <p className="font-body-md text-on-surface-variant line-clamp-3">{item.description}</p>
      </CardWrapper>
    )
  }

  return (
    <CardWrapper {...wrapperProps} className="group cursor-pointer block">
      <div className="relative overflow-hidden aspect-[16/9] rounded-lg mb-4 shadow-[0px_4px_20px_rgba(44,44,44,0.05)]">
        {imageSrc ? (
          <img
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            src={imageSrc}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-surface-container" />
        )}
        <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="font-label-caps text-primary">{rankLabel}</span>
        </div>
      </div>
      <h4 className="font-body-lg font-bold text-on-surface mb-1 line-clamp-2">{item.title}</h4>
      <p className="font-body-md text-on-surface-variant line-clamp-2">{item.description}</p>
    </CardWrapper>
  )
}

function BentoCard({ item, rank, bentoClass }) {
  const rankLabel = String(rank).padStart(2, '0')
  const imageSrc = getPostImageUrl(item)
  const CardWrapper = item.noteUrl ? 'a' : 'article'
  const wrapperProps = item.noteUrl
    ? { href: item.noteUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <CardWrapper {...wrapperProps} className={`bento-card ${bentoClass}`}>
      {imageSrc ? (
        <img className="bento-card-img" alt={item.title} src={imageSrc} loading="lazy" />
      ) : (
        <div className="bento-card-img bg-[var(--pale)]" />
      )}
      <span className="bento-card-num">{rankLabel}</span>
      <div className="bento-card-body">
        <div className="bento-card-meta">
          <span className="bento-card-tag">{formatCategory(item)}</span>
          <span className="bento-card-source">{formatSource(item)}</span>
        </div>
        <h3 className="bento-card-title">{item.title}</h3>
        <p className="bento-card-desc">{item.description}</p>
      </div>
    </CardWrapper>
  )
}

export default function TrendingSection({ variant = 'magazine' }) {
  const { language, ui } = useLanguage()
  const [trending, setTrending] = useState([])
  const [status, setStatus] = useState('loading')
  const limit = variant === 'bento' ? 5 : 3

  useEffect(() => {
    async function loadTrending() {
      setStatus('loading')
      try {
        const res = await fetch(`/api/trending?limit=${limit}&lang=${encodeURIComponent(language)}`)
        if (!res.ok) throw new Error('Failed to load trending')
        const data = await res.json()
        setTrending(data)
        setStatus(data.length ? 'ready' : 'empty')
      } catch {
        setStatus('error')
      }
    }
    loadTrending()
  }, [language, limit])

  const [featured, second, third] = trending
  const isBento = variant === 'bento'

  return (
    <section id="explore" className={isBento ? 'home-section' : 'w-full mb-32'}>
      <div className={isBento ? 'section-header' : 'flex items-end justify-between mb-12'}>
        <div>
          <span className={isBento ? 'section-eyebrow' : 'font-label-caps text-secondary-container block mb-2 uppercase tracking-widest'}>
            {isBento ? 'Curated from TikTok & RedNote' : ui.curatedDiscoveries}
          </span>
          <h2 className={isBento ? 'section-title' : 'font-headline-lg text-headline-lg text-primary'}>
            {isBento ? (
              <>
                What locals
                <br />
                are saying
              </>
            ) : (
              ui.whatsTrending
            )}
          </h2>
        </div>
        <Link
          to="/explore"
          className={
            isBento
              ? 'section-link'
              : 'font-label-caps text-on-surface-variant border-b border-outline-variant pb-1 hover:text-primary transition-colors'
          }
        >
          {isBento ? 'Full directory →' : ui.exploreFullDirectory}
        </Link>
      </div>

      {status === 'loading' && (
        <p className={isBento ? 'home-status' : 'text-on-surface-variant font-body-md'}>
          {ui.translating || ui.loadingTrending}
        </p>
      )}
      {status === 'error' && (
        <p className={isBento ? 'home-status' : 'text-on-surface-variant font-body-md'}>
          Could not load trending data. Start the API with{' '}
          <code className={isBento ? '' : 'text-primary'}>npm run dev:server</code>.
        </p>
      )}
      {status === 'empty' && (
        <p className={isBento ? 'home-status' : 'text-on-surface-variant font-body-md'}>
          No trending posts available yet.
        </p>
      )}

      {status === 'ready' && isBento && (
        <div className="bento">
          {trending.map((item, index) => (
            <BentoCard
              key={item.id || index}
              item={item}
              rank={index + 1}
              bentoClass={BENTO_CLASSES[index] || 'bento-card-c'}
            />
          ))}
        </div>
      )}

      {status === 'ready' && !isBento && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          <TrendingCard item={featured} rank={1} featured />
          <div className="md:col-span-5 flex flex-col gap-gutter">
            {second && <TrendingCard item={second} rank={2} />}
            {third && <TrendingCard item={third} rank={3} />}
          </div>
        </div>
      )}
    </section>
  )
}
