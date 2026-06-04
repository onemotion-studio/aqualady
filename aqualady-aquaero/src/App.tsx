import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import CartPage from './pages/CartPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>
    </Routes>
  )
}
