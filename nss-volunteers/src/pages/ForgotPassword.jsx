import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import AuthShell from '../components/AuthShell'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setLoading(false)
    if (error) { setMessage(error.message); return }
    setSent(true)
    setMessage('Reset link sent \u2014 check your inbox (and spam folder).')
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="No worries, we\u2019ll help you back in">
      <form onSubmit={submit} className="space-y-4">
        {message && (
          <div className={`rounded-2xl p-3 text-sm font-semibold ${sent ? 'bg-teal/10 text-teal' : 'bg-coral/10 text-coral'}`}>
            {message}
          </div>
        )}
        <label className="text-sm font-semibold text-ink/70">
          Email
          <input className="input mt-2" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <button className="primary flex w-full items-center justify-center gap-2" disabled={loading}>
          <Mail size={18} />
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link className="inline-flex items-center gap-1 font-semibold text-teal hover:underline" to="/login">
          <ArrowLeft size={15} /> Back to sign in
        </Link>
      </p>
    </AuthShell>
  )
}
