import { useState } from 'react'
import HeaderNav from '../components/HeaderNav.jsx'
import SiteFooter from '../components/SiteFooter.jsx'

const DESTINATIONS = ['Penang', 'Kuala Lumpur', 'Kuching']

const VIBE_OPTIONS = [
  { id: 'foodie', label: 'Foodie', icon: 'restaurant' },
  { id: 'nature', label: 'Nature', icon: 'landscape' },
  { id: 'history', label: 'History', icon: 'account_balance' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping_bag' },
  { id: 'museum', label: 'Museum', icon: 'museum' },
  { id: 'popular', label: 'Popular', icon: 'star' },
]

function VibeToggle({ option, checked, onChange }) {
  return (
    <label className="cursor-pointer group relative flex items-center justify-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(option.id, e.target.checked)}
      />
      <div className="px-5 py-2.5 rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant text-[14px] transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary peer-hover:border-primary/50 luxury-shadow-hover flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">{option.icon}</span>
        {option.label}
      </div>
    </label>
  )
}

export default function PlanPage() {
  const [destination, setDestination] = useState('Kuala Lumpur')
  const [destinationQuery, setDestinationQuery] = useState('')
  const [vibes, setVibes] = useState({ foodie: true, history: true })
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const toggleVibe = (id, checked) => {
    setVibes((prev) => ({ ...prev, [id]: checked }))
  }

  return (
    <div className="text-on-surface font-body-md min-h-screen flex flex-col antialiased bg-background bg-paper-texture relative overflow-x-hidden">
      <span className="material-symbols-outlined batik-watermark text-[400px] text-primary -top-20 -left-20 rotate-12 pointer-events-none">
        local_florist
      </span>
      <span className="material-symbols-outlined batik-watermark text-[300px] text-primary top-1/2 -right-20 -rotate-12 pointer-events-none">
        waves
      </span>
      <span className="material-symbols-outlined batik-watermark text-[250px] text-primary bottom-0 left-1/4 rotate-45 pointer-events-none">
        spa
      </span>

      <HeaderNav activePage="plan" />

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-28 pb-12 md:pt-32 md:pb-20 flex flex-col md:flex-row gap-6 md:gap-12 items-start z-10 relative">
        <div className="w-full md:w-1/3 flex flex-col gap-4 md:sticky md:top-28">
          <div className="flex items-center gap-2 text-secondary">
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            <span className="font-label-caps text-[12px] uppercase tracking-[0.1em]">AI Concierge</span>
          </div>
          <h1 className="font-display-lg text-[40px] md:text-[64px] text-primary leading-[1.1] tracking-[-0.02em]">
            Craft Your <br />
            <span className="italic text-surface-tint">Perfect</span> Journey.
          </h1>
          <p className="text-[16px] md:text-[18px] leading-relaxed text-on-surface-variant max-w-md">
            Let our intelligent planner curate a bespoke Malaysian experience tailored entirely to
            your sophisticated tastes. Tell us your desires, and we will weave the itinerary.
          </p>
        </div>

        <div className="w-full md:w-2/3 md:max-w-xl lg:max-w-2xl bg-surface-container-lowest luxury-shadow rounded-[32px] p-6 md:p-8 border border-outline-variant/30 flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-[22px] md:text-[24px] text-primary leading-tight">01. Where to?</h2>
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-[15px] rounded-full py-3 pl-11 pr-5 focus:ring-0 focus:border-primary transition-colors placeholder:text-outline/70 outline-none"
                placeholder="e.g. Penang, Kuala Lumpur, Langkawi..."
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {DESTINATIONS.map((city) => {
                const selected = destination === city
                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setDestination(city)}
                    className={`px-4 py-2 rounded-full font-body-md text-[14px] transition-colors flex items-center gap-1 ${
                      selected
                        ? 'border border-primary text-primary bg-primary/5'
                        : 'border border-outline-variant/50 text-on-surface-variant hover:border-primary hover:text-primary'
                    }`}
                  >
                    {city}
                    {selected && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <hr className="border-outline-variant/30" />

          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-[22px] md:text-[24px] text-primary leading-tight">02. Curate the Vibe</h2>
              <span className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase tracking-[0.1em]">
                Select multiple
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {VIBE_OPTIONS.map((option) => (
                <VibeToggle
                  key={option.id}
                  option={option}
                  checked={!!vibes[option.id]}
                  onChange={toggleVibe}
                />
              ))}
            </div>
          </section>

          <hr className="border-outline-variant/30" />

          <section className="flex flex-col gap-4">
            <h2 className="font-headline-md text-[22px] md:text-[24px] text-primary leading-tight">03. Timeframe</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  calendar_month
                </span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate && e.target.value > endDate) setEndDate('')
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-[15px] rounded-full py-3 pl-11 pr-5 focus:ring-0 focus:border-primary transition-colors cursor-pointer outline-none"
                  aria-label="Start date"
                />
              </div>
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                  calendar_month
                </span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant text-on-surface text-[15px] rounded-full py-3 pl-11 pr-5 focus:ring-0 focus:border-primary transition-colors cursor-pointer outline-none"
                  aria-label="End date"
                />
              </div>
            </div>
          </section>

          <div className="mt-4 flex flex-col items-center gap-4">
            <button
              type="button"
              className="w-full md:w-auto px-8 py-4 rounded-full bg-secondary text-white text-[16px] md:text-[18px] flex items-center justify-center gap-2 luxury-shadow hover:bg-secondary/90 transition-all hover:scale-[1.02]"
            >
              <span className="material-symbols-outlined">magic_button</span>
              Generate Itinerary
            </button>
            <p className="font-label-caps text-[10px] text-on-surface-variant/60 uppercase tracking-[0.15em] text-center flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Secure &amp; Personalized
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
