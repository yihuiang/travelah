import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

function TrendingCard({ item, rank, featured = false, trendingNowLabel }) {
  const rankLabel = String(rank).padStart(2, '0')
  const CardWrapper = item.noteUrl ? 'a' : 'article'
  const wrapperProps = item.noteUrl
    ? { href: item.noteUrl, target: '_blank', rel: 'noopener noreferrer' }
    : {}

  if (featured) {
    return (
      <CardWrapper
        {...wrapperProps}
        className="lg:col-span-8 group relative rounded-3xl overflow-hidden soft-shadow hover-lift cursor-pointer aspect-[16/10] lg:aspect-[4/3] block"
      >
        <img
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          src={item.image}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <div className="absolute top-8 left-8 z-20 flex flex-col gap-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-fixed opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-fixed" />
            </span>
            <span className="font-label-caps text-[10px]">{trendingNowLabel}</span>
          </div>
        </div>
        <div className="absolute bottom-12 left-12 right-12 z-20 text-white">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-headline-lg text-[120px] leading-none opacity-40 italic font-light">
              {rankLabel}
            </span>
            <div className="h-px flex-grow bg-white/20" />
            <div className="flex gap-2 flex-wrap">
              <span className="font-label-caps bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                {item.likesLabel}
              </span>
              {item.location && (
                <span className="font-label-caps bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                  📍 {item.location}
                </span>
              )}
            </div>
          </div>
          <h3 className="font-headline-lg text-3xl md:text-5xl lg:text-7xl mb-4 line-clamp-2">{item.title}</h3>
          <p className="font-body-lg text-white/70 max-w-lg mb-0 line-clamp-2">{item.description}</p>
        </div>
      </CardWrapper>
    )
  }

  return (
    <CardWrapper
      {...wrapperProps}
      className="group relative rounded-3xl overflow-hidden soft-shadow hover-lift cursor-pointer aspect-square block"
    >
      <img
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        src={item.image}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
      <div className="absolute top-6 right-6 z-20 font-headline-lg text-5xl text-white italic opacity-40">
        {rankLabel}
      </div>
      <div className="absolute bottom-8 left-8 z-20 text-white">
        <div className="font-label-caps text-secondary-fixed mb-2 line-clamp-1">{item.category}</div>
        <h3 className="font-headline-md text-2xl md:text-3xl mb-1 line-clamp-2">{item.title}</h3>
        <p className="font-body-md text-white/60 text-sm line-clamp-2">{item.description}</p>
      </div>
    </CardWrapper>
  )
}

export default function TrendingSection() {
  const { language, ui } = useLanguage()
  const [trending, setTrending] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    async function loadTrending() {
      setStatus('loading')
      try {
        const res = await fetch(`/api/trending?limit=3&lang=${encodeURIComponent(language)}`)
        if (!res.ok) throw new Error('Failed to load trending')
        const data = await res.json()
        setTrending(data)
        setStatus(data.length ? 'ready' : 'empty')
      } catch {
        setStatus('error')
      }
    }
    loadTrending()
  }, [language])

  const [featured, second, third] = trending

  return (
    <section id="explore" className="w-full">
      <div className="flex items-baseline justify-between mb-16 px-4">
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-secondary">{ui.curatedDiscoveries}</span>
          <h2 className="font-headline-lg text-primary text-6xl">{ui.whatsTrending}</h2>
        </div>
        <a
          className="font-label-caps text-on-surface-variant hover:text-primary transition-all flex items-center gap-3 group"
          href="#"
        >
          {ui.exploreFullDirectory}
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-2">
            arrow_right_alt
          </span>
        </a>
      </div>

      {status === 'loading' && (
        <p className="px-4 text-on-surface-variant font-body-md">{ui.translating || ui.loadingTrending}</p>
      )}
      {status === 'error' && (
        <p className="px-4 text-on-surface-variant font-body-md">
          Could not load trending data. Start the API with <code className="text-primary">npm run dev:server</code>.
        </p>
      )}
      {status === 'empty' && (
        <p className="px-4 text-on-surface-variant font-body-md">No trending posts available yet.</p>
      )}

      {status === 'ready' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <TrendingCard item={featured} rank={1} featured trendingNowLabel={ui.trendingNow} />
          <div className="lg:col-span-4 flex flex-col gap-8">
            {second && <TrendingCard item={second} rank={2} trendingNowLabel={ui.trendingNow} />}
            {third && <TrendingCard item={third} rank={3} trendingNowLabel={ui.trendingNow} />}
          </div>
        </div>
      )}
    </section>
  )
}
