import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_PASSWORD = 'AQUA2024'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      navigate('/admin/dashboard')
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-sand/20"
      >
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-800 mb-1">Panel Trenera</h1>
        <p className="text-xs sm:text-sm text-stone-400 mb-5">Zarzadzanie zajetosciami</p>

        <label className="text-xs sm:text-sm font-medium text-stone-600 mb-1.5 block">Haslo dostepowe</label>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          placeholder="********"
          className={`w-full px-4 py-3 sm:py-3.5 rounded-xl text-sm border transition-all outline-none ${
            error
              ? 'border-red-400 bg-red-50 text-red-700'
              : 'border-sand/30 bg-white text-stone-800 focus:border-teal-brand'
          }`}
          autoFocus
        />
        {error && (
          <p className="text-xs sm:text-sm text-red-500 mt-1.5">Nieprawidlowe haslo. Sprobuj ponownie.</p>
        )}

        <button
          type="submit"
          className="w-full mt-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-teal-brand text-white font-bold text-sm sm:text-base shadow-lg hover:bg-teal-light active:scale-[0.98] transition-all"
        >
          Zaloguj sie
        </button>
      </form>
    </div>
  )
}
