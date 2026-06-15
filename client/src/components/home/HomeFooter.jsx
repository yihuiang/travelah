import { Link, useLocation } from 'react-router-dom'

export default function HomeFooter() {
  const location = useLocation()
  const year = new Date().getFullYear()

  return (
    <footer className="home-footer">
      <div className="footer-top">
        <Link to="/" className="footer-logo">
          travelah
        </Link>
        <ul className="footer-nav">
          <li>
            <a href="#explore">Destinations</a>
          </li>
          <li>
            <a href="#">Heritage</a>
          </li>
          <li>
            <a href="#">Culture</a>
          </li>
          <li>
            <a href="#">About</a>
          </li>
          <li>
            <a href="#">Contact</a>
          </li>
          <li>
            <Link to="/login" state={{ background: location }} className="btn-pill">
              Get started
            </Link>
          </li>
        </ul>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© {year} travelah — crafted for the discerning explorer.</span>
        <div className="footer-social">
          <span className="material-symbols-outlined">language</span>
          <span className="material-symbols-outlined">share</span>
          <span className="material-symbols-outlined">photo_camera</span>
        </div>
      </div>
    </footer>
  )
}
