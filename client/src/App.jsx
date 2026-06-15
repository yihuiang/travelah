import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ExplorePage from './pages/ExplorePage.jsx'
import PlaceDetailPage from './pages/PlaceDetailPage.jsx'
import HomePage from './pages/HomePage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import ItineraryPage from './pages/ItineraryPage.jsx'
import TripsPage from './pages/TripsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'

function AppRoutes() {
  const location = useLocation()
  const isAuthModal = location.pathname === '/login' || location.pathname === '/register'
  const background = isAuthModal ? location.state?.background : null
  const pageLocation = background ?? (isAuthModal ? { pathname: '/' } : location)

  return (
    <>
      <Routes location={pageLocation}>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/explore/place/:id" element={<PlaceDetailPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
        <Route path="/trips" element={<TripsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>

      {isAuthModal && (
        <Routes location={location}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
