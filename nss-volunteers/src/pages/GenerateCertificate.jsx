import { useEffect, useState } from 'react'
import { Award, CheckCircle2, LockKeyhole } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { CERTIFICATES } from '../lib/certificateConfig'
import { useAuth } from '../context/AuthContext'

const CONFETTI_COLORS = ['#FF6F59', '#FFB627', '#1FAE9F']

function Confetti() {
  const pieces = Array.from({ length: 16 })
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 6.2) % 100}%`,
            top: `${10 + (i % 3) * 8}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 5) * 60}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default function GenerateCertificate() {
  const { user } = useAuth()
  const [selected, setSelected] = useState(CERTIFICATES[0].id)
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState([])
  const [celebrate, setCelebrate] = useState(false)

  async function loadGenerated() {
    const { data } = await supabase.from('certificates').select('*').eq('user_id', user.id)
    setGenerated(data || [])
  }

  useEffect(() => { loadGenerated() }, [user])

  async function generate(e) {
    e.preventDefault()
    setMessage('')
    setStatus('')
    if (!/^\d{2}$/.test(code)) return setMessage('Enter the 2-digit certificate code.')

    setLoading(true)
    const { data, error } = await supabase.rpc('generate_certificate', {
      p_certificate_key: selected,
      p_code: code,
    })
    setLoading(false)

    if (error) return setMessage(error.message)

    if (data.status === 'wrong_code') {
      setStatus('locked')
      setMessage('That code isn\u2019t quite right \u2014 kindly participate in an NSS event/activity to receive it.')
    } else if (data.status === 'locked') {
      setStatus('locked')
      setMessage(`This certificate is locked until ${new Date(data.locked_until).toLocaleString()}.`)
    } else if (data.status === 'already_generated' || data.status === 'generated') {
      setStatus('generated')
      setMessage('Certificate unlocked! Nicely done.')
      loadGenerated()
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 1000)
    }
  }

  const config = CERTIFICATES.find(c => c.id === selected)
  const isGenerated = generated.some(c => c.certificate_key === selected)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7">
        <span className="chip bg-teal/15 text-teal"><Award size={14}/> Certificates</span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Generate a certificate</h1>
        <p className="mt-1 text-ink/50">Certificates can only be generated for your own account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="card p-6">
          <h2 className="font-display text-xl font-semibold text-ink">Select certificate</h2>
          <div className="mt-5 space-y-3">
            {CERTIFICATES.map(c => {
              const done = generated.some(g => g.certificate_key === c.id)
              return (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c.id); setCode(''); setMessage(''); setStatus('') }}
                  className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left font-semibold transition ${
                    selected === c.id ? 'bg-coral text-white shadow-puff-sm' : 'bg-cream text-ink/70'
                  }`}
                >
                  <span className={`seal h-8 w-8 shrink-0 ${selected === c.id ? '' : 'opacity-70'}`}>
                    {done ? <CheckCircle2 size={15}/> : <Award size={15}/>}
                  </span>
                  <span className="flex-1">{c.title}</span>
                  {done && <span className="text-xs">Earned</span>}
                </button>
              )
            })}
          </div>

          <form onSubmit={generate} className="mt-7">
            <label className="text-sm font-semibold text-ink/70">
              2-digit secret code
              <input
                className="input mt-2 text-center text-2xl font-display tracking-[.5em]"
                maxLength={2}
                inputMode="numeric"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 2))}
                disabled={status === 'locked' || isGenerated}
              />
            </label>
            <button className="primary mt-4 flex w-full items-center justify-center gap-2" disabled={loading || status === 'locked' || isGenerated}>
              {isGenerated ? <><CheckCircle2 size={18}/> Already generated</> : status === 'locked' ? <><LockKeyhole size={18}/> Locked</> : loading ? 'Checking…' : 'Generate certificate'}
            </button>
          </form>

          {message && (
            <div className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${status === 'generated' ? 'bg-teal/10 text-teal' : 'bg-coral/10 text-coral'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="card relative overflow-hidden p-5">
          {celebrate && <Confetti />}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-ink">{config.title}</h2>
            <span className="chip bg-marigold/15 text-marigold">Preview</span>
          </div>
          <img src={config.template} alt={config.title} className="w-full rounded-2xl stamp-border" />
        </div>
      </div>
    </div>
  )
}
