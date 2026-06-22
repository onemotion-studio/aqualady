import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import CartPage from './pages/CartPage'
import AdminLogin from './pages/AdminLogin'
import TrainerDashboard from './pages/TrainerDashboard'
import { ScheduleProvider } from './context/ScheduleContext'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    const doScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    }
    doScroll()
    requestAnimationFrame(doScroll)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <ScheduleProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<TrainerDashboard />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Route>
      </Routes>
    </ScheduleProvider>
  )
}
