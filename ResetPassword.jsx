import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, CheckCircle2 } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return setMessage(error.message)
    setDone(true)
    setMessage('Password updated \u2014 taking you to sign in…')
    setTimeout(() => navigate('/login'), 1200)
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Make it something only you\u2019d remember">
      <form onSubmit={submit} className="space-y-4">
        {message && (
          <div className={`flex items-center gap-2 rounded-2xl p-3 text-sm font-semibold ${done ? 'bg-teal/10 text-teal' : 'bg-coral/10 text-coral'}`}>
            {done && <CheckCircle2 size={16} />} {message}
          </div>
        )}
        <label className="text-sm font-semibold text-ink/70">
          New password
          <input className="input mt-2" type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        </label>
        <button className="primary flex w-full items-center justify-center gap-2" disabled={loading}>
          <KeyRound size={18} />
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  )
}
