export default function SiteFooter() {
  return (
    <footer className="bg-white w-full px-margin-mobile md:px-margin-desktop py-24 flex flex-col items-center gap-12 border-t border-outline-variant/30">
      <div className="font-headline-lg text-5xl text-primary tracking-tighter">travelah</div>
      <nav className="flex flex-wrap justify-center gap-x-12 gap-y-6">
        <a className="font-label-caps text-on-surface-variant hover:text-primary transition-all" href="#explore">
          Destinations
        </a>
        <a className="font-label-caps text-on-surface-variant hover:text-primary transition-all" href="#">
          Heritage
        </a>
        <a className="font-label-caps text-on-surface-variant hover:text-primary transition-all" href="#">
          Culture
        </a>
        <a className="font-label-caps text-on-surface-variant hover:text-primary transition-all" href="#">
          About
        </a>
        <a className="font-label-caps text-on-surface-variant hover:text-primary transition-all" href="#">
          Contact
        </a>
      </nav>
      <div className="editorial-rule w-32" />
      <div className="flex flex-col items-center gap-2">
        <p className="font-body-md text-sm text-on-surface-variant/50">
          © {new Date().getFullYear()} travelah. Crafted for the discerning explorer.
        </p>
        <div className="flex gap-6 mt-4">
          <span className="material-symbols-outlined text-primary/40 cursor-pointer hover:text-primary transition-colors">
            language
          </span>
          <span className="material-symbols-outlined text-primary/40 cursor-pointer hover:text-primary transition-colors">
            share
          </span>
        </div>
      </div>
    </footer>
  )
}
