import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Sprout } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState('info')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setMessage('')
    if (password.length < 6) { setTone('error'); return setMessage('Password needs at least 6 characters.') }
    if (password !== confirm) { setTone('error'); return setMessage('Those passwords don\u2019t match yet.') }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) { setTone('error'); return setMessage(error.message) }
    if (!data.session) {
      setTone('info')
      setMessage('Almost there \u2014 check your email to confirm your account, then sign in.')
      return
    }
    navigate('/dashboard')
  }

  return (
    <AuthShell title="Join the NSS family" subtitle="Set up your volunteer account in a minute">
      <form onSubmit={submit} className="space-y-4">
        {message && (
          <div className={`rounded-2xl p-3 text-sm font-semibold ${tone === 'error' ? 'bg-coral/10 text-coral' : 'bg-teal/10 text-teal'}`}>
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
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/70" aria-label="Toggle password visibility">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <label className="text-sm font-semibold text-ink/70">
          Confirm password
          <input className="input mt-2" type={showPassword ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
        </label>
        <button className="primary flex w-full items-center justify-center gap-2" disabled={loading}>
          <Sprout size={18} />
          {loading ? 'Creating your account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Already a volunteer? <Link className="font-semibold text-teal hover:underline" to="/login">Sign in</Link>
      </p>
    </AuthShell>
  )
}
