import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ExplorePage from './pages/ExplorePage.jsx'
import HomePage from './pages/HomePage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
