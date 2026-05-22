import { Link } from 'react-router-dom'
import HeaderNav from '../components/HeaderNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import TrendingSection from '../components/TrendingSection.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const MARQUEE_ITEMS = [
  { emoji: '🏝️', label: 'Langkawi sunset spots', variant: 'filled' },
  { emoji: '☕', label: 'Penang cafe hopping', variant: 'outline' },
  { emoji: '✨', label: '热门打卡地点', variant: 'primary' },
  { emoji: '🛶', label: 'Sabah hidden beaches', variant: 'filled' },
  { emoji: '🌶️', label: 'Food hunting Malaysia', variant: 'outline' },
]

function MarqueePill({ emoji, label, variant }) {
  const base = 'pill-refined px-6 py-2.5 rounded-full text-xs font-label-caps flex items-center gap-3'
  const variants = {
    filled: `${base} bg-surface-container`,
    outline: `${base} border border-outline-variant`,
    primary: `${base} bg-primary text-white`,
  }
  return (
    <div className={variants[variant]}>
      <span>{emoji}</span> {label}
    </div>
  )
}

export default function HomePage() {
  const { ui } = useLanguage()
  const marqueeDoubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS.slice(0, 2)]

  return (
    <div
      className="text-on-surface font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture"
      style={{ backgroundBlendMode: 'soft-light' }}
    >
      <HeaderNav />

      <main className="flex-grow flex flex-col items-center w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-40 pb-24 gap-32">
        <section className="w-full flex flex-col items-center justify-center min-h-[50vh] relative">
          <div className="absolute -z-10 top-0 opacity-10 blur-3xl w-[800px] h-[400px] bg-primary rounded-full filter mix-blend-multiply" />
          <h1 className="font-display-lg text-primary max-w-6xl text-center flex flex-col leading-none">
            <span className="mb-2 md:mb-4 text-[44px] md:text-[60px] leading-none">
              {ui.welcomeTo}
            </span>
            <span className="italic font-light tracking-tight text-[56px] md:text-[140px] block leading-none md:-translate-y-4">
              {ui.malaysia}
            </span>
          </h1>
          <div className="editorial-rule w-full max-w-lg my-12" />
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl">
            <p className="font-body-lg text-on-surface-variant max-w-md text-left leading-relaxed opacity-80 border-l border-primary/20 pl-8">
              {ui.heroSubtitle}
            </p>
            <div className="flex-grow w-full max-w-lg group">
              <div className="relative flex items-center bg-surface-container-low border border-outline-variant rounded-full p-1.5 focus-within:ring-1 focus-within:ring-primary transition-all duration-500">
                <div className="pl-6 flex items-center text-primary/40 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="flex-grow bg-transparent border-none focus:ring-0 text-body-lg text-on-surface placeholder-on-surface-variant/40 px-4 outline-none"
                  placeholder={ui.searchPlaceholder}
                  type="text"
                />
                <button
                  type="button"
                  className="bg-primary text-on-primary rounded-full px-8 py-3.5 font-label-caps hover:bg-primary-container transition-all active:scale-95"
                >
                  {ui.exploreBtn}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="w-screen relative left-1/2 -translate-x-1/2 py-12 overflow-hidden border-y border-outline-variant/30 flex flex-col gap-8 bg-surface-container-lowest/50">
          <div className="marquee-container flex overflow-hidden select-none">
            <div className="animate-marquee whitespace-nowrap flex gap-6 items-center px-6">
              {marqueeDoubled.map((item, i) => (
                <span key={i} className="flex gap-6 items-center">
                  <MarqueePill {...item} />
                  <span className="text-outline-variant">/</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <TrendingSection />

        <section
          id="plan"
          className="w-full grid lg:grid-cols-2 gap-16 items-center py-20 px-8 bg-surface-container-low rounded-[3rem] relative overflow-hidden"
        >
          <div
            className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
            style={{
              backgroundImage: "url('https://www.transparenttextures.com/patterns/linen.png')",
            }}
          />
          <div className="relative z-10 flex flex-col gap-8">
            <div className="w-12 h-12 rounded-full border border-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
            </div>
            <h2 className="font-headline-lg text-6xl text-primary leading-[1.1]">
              Your Perfect Journey, <br />
              <span className="italic">Synthesized.</span>
            </h2>
            <p className="font-body-lg text-on-surface-variant max-w-md opacity-80">
              Our bespoke AI planner understands that true travel is about feeling, not just
              visiting. We curate itineraries that balance high-energy discovery with moments of
              pure tranquility.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <Link
                to="/plan"
                className="bg-primary text-white px-10 py-5 rounded-full font-label-caps hover:bg-primary-container hover:shadow-xl transition-all flex items-center gap-3"
              >
                Start Planning <span className="material-symbols-outlined text-sm">east</span>
              </Link>
              <button
                type="button"
                className="border border-outline px-10 py-5 rounded-full font-label-caps hover:bg-white transition-all"
              >
                View Case Studies
              </button>
            </div>
          </div>
          <div className="relative lg:h-[400px] flex items-center justify-center">
            <div className="w-full h-full border border-primary/10 rounded-2xl p-8 relative flex flex-col justify-center items-center gap-4 bg-white/50 backdrop-blur-sm">
              <div className="w-full h-px bg-primary/10" />
              <div className="text-primary font-headline-md italic opacity-60 text-center">
                &ldquo;The Sabah itinerary was perfect—the timing between the jungle hike and the
                spa retreat was impeccable.&rdquo;
              </div>
              <div className="font-label-caps text-on-surface-variant">— Eleanor R., London</div>
              <div className="w-full h-px bg-primary/10" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 border border-primary/20 rounded-full opacity-50" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
