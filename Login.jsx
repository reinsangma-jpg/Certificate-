import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, HeartHandshake } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setMessage(error.message)
    navigate('/dashboard')
  }

  return (
    <AuthShell title="Welcome back, volunteer" subtitle="Sign in to pick up where you left off">
      <form onSubmit={submit} className="space-y-4">
        {message && (
          <div className="flex items-center gap-2 rounded-2xl bg-coral/10 p-3 text-sm font-semibold text-coral">
            {message}
          </div>
        )}
        <label className="text-sm font-semibold text-ink/70">
          Email
          <input className="input mt-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="text-sm font-semibold text-ink/70">
          Password
          <div className="relative mt-2">
            <input
              className="input pr-11"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button className="primary flex w-full items-center justify-center gap-2" disabled={loading}>
          <HeartHandshake size={18} />
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link className="font-semibold text-teal hover:underline" to="/forgot-password">Forgot password?</Link>
        <Link className="font-semibold text-coral hover:underline" to="/signup">Create account</Link>
      </div>
    </AuthShell>
  )
}
