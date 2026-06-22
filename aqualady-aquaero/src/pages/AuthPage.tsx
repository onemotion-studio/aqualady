import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthPage() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'login') {
      const err = await signIn(email, password)
      if (err) {
        setError(err)
        setLoading(false)
      } else {
        navigate('/')
      }
    } else {
      if (!name.trim()) {
        setError('Podaj imię i nazwisko')
        setLoading(false)
        return
      }
      const err = await signUp(email, password, name)
      if (err) {
        setError(err)
      } else {
        setSuccess('Rejestracja udana! Sprawdź swoją skrzynkę email, aby potwierdzić konto.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-sm sm:max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-sand/20"
        >
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-stone-800 mb-1">
            {mode === 'login' ? 'Zaloguj się' : 'Rejestracja'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mb-5">
            {mode === 'login'
              ? 'Zaloguj się, aby zarządzać rezerwacjami'
              : 'Zarejestruj się, aby rezerwować zajęcia'}
          </p>

          {mode === 'register' && (
            <div className="mb-3">
              <label className="text-xs sm:text-sm font-medium text-stone-600 mb-1.5 block">
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jan Kowalski"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="text-xs sm:text-sm font-medium text-stone-600 mb-1.5 block">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="twoj@email.pl"
              className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-xs sm:text-sm font-medium text-stone-600 mb-1.5 block">
              Hasło
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-sand/30 text-sm focus:border-teal-brand focus:outline-none"
              required
              minLength={6}
            />
          </div>

          {error && (
            <p className="text-xs sm:text-sm text-red-500 mb-3">{error}</p>
          )}
          {success && (
            <p className="text-xs sm:text-sm text-green-accent mb-3">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading || !!success}
            className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-teal-brand text-white font-bold text-sm sm:text-base shadow-lg hover:bg-teal-light active:scale-[0.98] transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Proszę czekać...' : mode === 'login' ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>

          <p className="text-xs sm:text-sm text-stone-500 text-center mt-4">
            {mode === 'login' ? (
              <>Nie masz konta?{' '}
                <button type="button" onClick={() => { setMode('register'); setError(''); setSuccess('') }} className="text-teal-brand font-medium underline underline-offset-4">
                  Zarejestruj się
                </button>
              </>
            ) : (
              <>Masz już konto?{' '}
                <button type="button" onClick={() => { setMode('login'); setError(''); setSuccess('') }} className="text-teal-brand font-medium underline underline-offset-4">
                  Zaloguj się
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  )
}
