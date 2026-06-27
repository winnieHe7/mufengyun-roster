import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import StatsPage from './pages/StatsPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import LoginForm from './components/LoginForm.jsx'
import ProfilePage from './components/ProfilePage.jsx'

/**
 * 主应用组件 · 路由配置
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}
