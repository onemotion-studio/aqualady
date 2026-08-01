import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signUp, signIn } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    let result: string | null
    if (isRegister) {
      result = await signUp(email, password, name)
    } else {
      result = await signIn(email, password)
    }

    if (result) {
      setError(result)
      setLoading(false)
    } else {
      // Success — redirect to home
      navigate('/')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center pt-4 pb-8">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-sand/10">
          <h1 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">
            {isRegister ? 'Rejestracja' : 'Zaloguj się'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mb-6">
            {isRegister
              ? 'Założ konto, aby zarządzać rezerwacjami'
              : 'Zaloguj się, aby zobaczyć swoje rezerwacje'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-stone-600">Imię i nazwisko</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jan Kowalski"
                  required
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-stone-600">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="twoj@email.pl"
                required
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs sm:text-sm font-medium text-stone-600">Hasło</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 znaków"
                required
                minLength={6}
                className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-xs sm:text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base bg-gradient-primary text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:bg-stone-300 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Proszę czekać...'
                : isRegister
                  ? 'Zarejestruj się'
                  : 'Zaloguj się'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError('') }}
              className="text-xs sm:text-sm text-teal-brand font-medium underline underline-offset-4"
            >
              {isRegister
                ? 'Masz już konto? Zaloguj się'
                : 'Nie masz konta? Zarejestruj się'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
