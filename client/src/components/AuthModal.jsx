import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export const AUTH_HERO_LOGIN =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAnaK6CidCc1hckrJjf7gcdqzkqHFRQ91Tnpy15-hGjgEKvrI3wDxUwIp4x7Vc2dX5COnRTnjJto-S-TkOd6eD1dfKlUi-njCQGnO-aLJi5yZie6zFW6r1rbYP20D4N1onVwDoR0lsmmdEzgqOHq74vZsJSmQk1IPzqYbtINBqjnF8dQV0mL3nxtufi_STe4MPvU51ggE1IDlRNa1A9xoqtWD8Z2CzXc94CnP2hQALyAnziEammDD3nq529PjbKVhzOhPSXycfoMbY'

export const AUTH_HERO_REGISTER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDxqej0KH3QB_fGybwqT_Tt7kyU8KE4TzQNGCoHvS90AbDop_zolEXucJSDoeI49j-Ezr9iYCNXYV4tCvcMmBNaPXRhGuT-FFapke5BHERYYa5IpNE9CQdps7Fl3E2IRXUsOhiEBY6Irkbnvrx0Qtr92GjB_j1NCeI0MpzfmBii7zVtepz76_-oITjp4GX-EULaQaZS0VEKTaa3P_A6p8_uOBpUFyw1bR4CMxBRgZnGIusqEuv78glwF5s1tqO8k9I_ZONv48oXU9g'

export default function AuthModal({
  children,
  imageAlt = 'Malaysia travel scenery',
  heroImage = AUTH_HERO_LOGIN,
  overlayTitle = 'Begin Your Journey',
  overlayDescription = 'Discover Malaysia with your personal AI concierge.',
  showEditorialIcons = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const background = location.state?.background

  const closeModal = useCallback(() => {
    if (background) {
      navigate(background.pathname + (background.search || ''), { replace: true })
      return
    }
    navigate('/', { replace: true })
  }, [background, navigate])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeModal])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-md"
        aria-label="Close dialog"
        onClick={closeModal}
      />

      <div className="relative w-full max-w-[1100px] flex rounded-[2rem] overflow-hidden bg-background shadow-[0_24px_80px_rgba(44,44,44,0.18)]">
        <button
          type="button"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-surface-container-lowest/90 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-colors"
          aria-label="Close"
          onClick={closeModal}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="w-full md:w-1/2 flex flex-col justify-center overflow-hidden px-8 py-10 sm:px-12 sm:py-10">
          <div className="w-full max-w-lg mx-auto space-y-6">{children}</div>
        </div>

        <div className="hidden md:block md:w-1/2 relative min-h-[520px] bg-surface-variant">
          <img alt={imageAlt} className="absolute inset-0 w-full h-full object-cover" src={heroImage} />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10 text-on-primary">
            <h2 className="font-display-lg text-display-lg-mobile sm:text-display-lg mb-4 leading-none">
              {overlayTitle}
            </h2>
            <p className="font-body-lg text-body-lg max-w-md opacity-90">{overlayDescription}</p>
            {showEditorialIcons && (
              <div className="mt-8 flex gap-4 opacity-50">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                  spa
                </span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                  landscape
                </span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                  sailing
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
