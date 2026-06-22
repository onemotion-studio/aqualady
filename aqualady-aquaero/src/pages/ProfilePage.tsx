import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loadBookingsFromServer, supabase } from '../lib/supabase'
import { loadPools } from '../config'

interface BookingWithPool {
  id: number
  pool_id: string
  date: string
  time: string
  quantity: number
  poolName: string
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, signOut, loading } = useAuth()
  const [bookings, setBookings] = useState<BookingWithPool[]>([])
  const [pools, setPools] = useState<Record<string, any>>({})
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    setPools(loadPools())
  }, [])

  useEffect(() => {
    if (!user && !loading) {
      navigate('/auth')
      return
    }
    if (!user) return

    setLoadingBookings(true)
    loadBookingsFromServer().then(data => {
      const allPools = loadPools()
      const myBookings = data
        .filter(b => b.user_id === user.id || (user.email && b.email === user.email))
        .map(b => ({
          id: b.id,
          pool_id: b.pool_id,
          date: b.date,
          time: b.time,
          quantity: b.quantity,
          poolName: allPools[b.pool_id]?.name || b.pool_id,
        }))
        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
      setBookings(myBookings)
      setLoadingBookings(false)
    }).catch(() => setLoadingBookings(false))
  }, [user, loading])

  const cancelBooking = async (bookingId: number) => {
    if (!supabase) return
    setCancellingId(bookingId)
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .match({ id: bookingId })
      if (!error) {
        setBookings(prev => prev.filter(b => b.id !== bookingId))
      }
    } catch (e) {
      console.error('Failed to cancel booking:', e)
    }
    setCancellingId(null)
  }

  const getTimeLabel = (timeValue: string) => {
    const hour = timeValue.replace('slot_', '')
    const h = parseInt(hour.slice(0, 2))
    if (!isNaN(h)) return `${h}:00 - ${h + 1}:00`
    return timeValue
  }

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-stone-400">Proszę czekać...</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-8 pt-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pt-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">Moje konto</h1>
        <button
          onClick={signOut}
          className="text-xs sm:text-sm text-stone-400 underline hover:text-stone-600"
        >
          Wyloguj się
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10">
        <p className="text-sm sm:text-base font-medium text-stone-700">
          {user?.user_metadata?.full_name || 'Użytkownik'}
        </p>
        <p className="text-xs sm:text-sm text-stone-400">{user?.email}</p>
      </div>

      <div>
        <h2 className="text-base sm:text-lg font-bold text-stone-800 mb-3">Moje rezerwacje</h2>

        {loadingBookings ? (
          <p className="text-sm text-stone-400">Ładowanie rezerwacji...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-sand/10 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-stone-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-stone-500 mb-2">Brak rezerwacji</p>
            <button
              onClick={() => navigate('/booking')}
              className="text-sm text-teal-brand font-medium underline underline-offset-4"
            >
              Przejdź do wyboru zajęć
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-sand/10"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-teal-brand font-semibold">
                      {booking.poolName}
                    </p>
                    <p className="text-sm sm:text-base font-semibold text-stone-800 mt-0.5">
                      {booking.date.slice(8, 10)}.{booking.date.slice(5, 7)}.{booking.date.slice(0, 4)}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-500">
                      {getTimeLabel(booking.time)}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {booking.quantity} {booking.quantity === 1 ? 'osoba' : 'osoby'}
                    </p>
                  </div>
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    disabled={cancellingId === booking.id}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-medium hover:bg-red-50 active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    {cancellingId === booking.id ? '...' : 'Anuluj'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
