import { useState } from 'react'
import HeaderNav from '../components/HeaderNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

const FILTERS = ['ALL', 'FOOD', 'CULTURE', 'NATURE', 'HIDDEN GEMS']

const TRENDING_CARDS = [
  {
    rank: '01',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDrsvu4SLfDxz2SZF7YtXh_sSC7ZQ5cVQcDR8Pch6_mJa9HNQ-fnKxx3TvoujnV1fbozYej7Mg0JASxrXL_gLvTdHysXAAflmKqcxRAPJEm7Z8sGGhxnfvwkKPMR2ueiAAGRvkuBgD4vYpPxfuIAexHRmTZ0rPAk0h7zhhsF3GYDMD43_RcsSKiMuQJwicVwDrww6c0WvyjTeh5Hy6ljOdz3UTeqCbE8XdMomtAQgFLdsWjIefdI5y3RhpauTYeP_XusmekHtLCkBo',
    alt: 'George Town',
    title: 'Heritage Bites of George Town',
    description:
      "Deciphering the digital heartbeat of Malaysia's travel landscape through authentic street flavors.",
    tags: ['CULINARY', 'HERITAGE'],
    likes: '4.9M LIKES',
    saved: '1.2M SAVED',
    source: 'VIA REDNOTE',
    sourceIcon: 'database',
  },
  {
    rank: '02',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCHFVIZL6pywLDdWc7dwmuqTFidpyV2VD2l4JwwMdUfG_rErPIMPQMVoeIWUDybx1uDxjV7jG3D3QW9aNlUCqxXL_d4vss__bqyht-8xQWHOApeGVJhBQJR4m7dhS4EJRQE6l2pCrN9ICdK9OzCFbFIbQx3C2W5p-MZqiikvtwlksxLpMDEQL5G3bbdoxPYeTWSm5kOEV5t6dqJduNJM2bZsZOd0W-n6F2HGmyF2eJfc1VC8Srthw_zDZDjI-7-fpXvOFc5FsOfbNo',
    alt: 'Mossy Forest',
    title: 'The Ethereal Mossy Forest',
    description:
      'A surge in international exploration interest following major documentary features.',
    tags: ['NATURE', 'EXPLORE'],
    likes: '2.4M LIKES',
    saved: '850K SAVED',
    source: 'VIA TIKTOK',
    sourceIcon: 'music_note',
  },
  {
    rank: '03',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaDhOL4uIEMeLAtgzL5oD1eQCNSU-6Zwzn-uGwRB_VcY7AXAibQR4NX24qnR-79y7kHJHNQ1B50C1VSOCQiGefgWXVYxJ9pcGHNZUqQRF94bYQmhn26i_I30WYmTb8fF06RXdZh7W6mbJKgs0f64Ydd4PQrGWS-EbNGlnWOckRwLYRUf5onNMhnWXsGWo5mwl96jTcnd0JaCRv5fS8dRlcxj8_d3dNnQELRYMiaHvcHovQ6tIj_fd8gLpGdgazqTBM1tZcuJMujT8',
    alt: 'Silk Batik',
    title: 'Silk Batik Mastery',
    description:
      'The most talked-about cultural moments trending across the peninsula right now.',
    tags: ['CULTURE', 'HERITAGE'],
    likes: '1.1M LIKES',
    saved: '320K SAVED',
    source: 'VIA INSTAGRAM',
    sourceIcon: 'photo_camera',
  },
]

function ExploreCard({ card }) {
  return (
    <article className="flex flex-col group">
      <div className="relative mb-6">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
          <img
            alt={card.alt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={card.image}
          />
          <div className="absolute top-4 right-6 rank-number-outline font-headline-lg text-4xl italic">
            {card.rank}
          </div>
        </div>
        <div className="absolute -bottom-6 -right-1 bg-surface w-16 h-16 rounded-tl-[2rem] flex items-center justify-center">
          <button
            type="button"
            className="w-12 h-12 bg-primary-fixed rounded-full flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors cursor-pointer"
            aria-label="Save"
          >
            <span className="material-symbols-outlined text-xl">bookmark</span>
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-headline-md text-2xl text-primary mb-2">{card.title}</h3>
        <p className="font-body-md text-sm text-on-surface-variant mb-4 line-clamp-2">{card.description}</p>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className={`px-3 py-1 rounded-full text-[10px] font-label-caps ${
                tag === card.tags[0]
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-outline-variant/20">
          <div className="flex items-center gap-6 w-full">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">favorite</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{card.likes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-secondary">bookmark</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant">{card.saved}</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <span className="font-label-caps text-[9px] text-primary/50">{card.source}</span>
              <span className="material-symbols-outlined text-[16px] opacity-60 text-secondary">
                {card.sourceIcon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState('ALL')

  return (
    <div
      className="text-on-surface font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture"
      style={{ backgroundBlendMode: 'soft-light' }}
    >
      <HeaderNav activePage="explore" />

      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop pt-40 pb-20">
        <section className="mb-20 relative">
          <div className="max-w-2xl">
            <h1 className="font-display-lg text-display-lg md:text-[96px] text-primary mb-6 leading-none">
              The Pulse
              <br />
              <span className="italic font-light">of Malaysia</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              The most talked-about destinations, flavors, and cultural moments trending across the
              peninsula right now.
            </p>
          </div>
        </section>

        <section className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-surface-container rounded-full border border-outline-variant/30">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2.5 rounded-full font-label-caps text-[11px] tracking-widest transition-all ${
                  activeFilter === filter
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-primary hover:bg-white/50'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-3 px-8 py-3 rounded-full border border-primary text-primary font-label-caps text-[11px] tracking-widest hover:bg-primary hover:text-on-primary transition-all"
          >
            SORT BY: TRENDING NOW
            <span className="material-symbols-outlined text-sm">swap_vert</span>
          </button>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TRENDING_CARDS.map((card) => (
              <ExploreCard key={card.rank} card={card} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
