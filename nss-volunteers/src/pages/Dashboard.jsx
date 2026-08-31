import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Award, Edit3, Sparkles } from 'lucide-react'
import IdCard from '../components/IdCard'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { CERTIFICATES } from '../lib/certificateConfig'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('certificates').select('*').eq('user_id', user.id).order('generated_at', { ascending: false })
    ])
    setProfile(p)
    setCertificates(c || [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  useEffect(() => {
    if (!loading && !profile?.full_name) navigate('/onboarding', { replace: true })
  }, [loading, profile, navigate])

  if (loading || !profile?.full_name) {
    return <div className="py-16 text-center font-semibold text-ink/50">Fetching your NSS dashboard…</div>
  }

  const firstName = profile.full_name.split(' ')[0]

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip bg-marigold/15 text-marigold"><Sparkles size={14}/> Dashboard</span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Hey {firstName} 👋</h1>
          <p className="mt-1 text-ink/50">Here's your volunteer identity and your earned certificates.</p>
        </div>
        <Link className="secondary flex items-center gap-2" to="/profile"><Edit3 size={17}/> Edit profile</Link>
      </div>

      <IdCard profile={profile} />

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-ink">My certificates</h2>
          <Link className="font-semibold text-teal hover:underline" to="/generate-certificate">Generate one →</Link>
        </div>
        {certificates.length === 0 ? (
          <div className="card stamp-border p-8 text-center text-ink/50">
            No certificates yet — take part in an NSS activity to unlock your first one.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {certificates.map(c => {
              const config = CERTIFICATES.find(x => x.id === c.certificate_key)
              return (
                <div key={c.id} className="card overflow-hidden">
                  <img src={config?.template} alt={c.certificate_title} className="aspect-video w-full object-cover" />
                  <div className="flex items-center gap-3 p-4">
                    <span className="seal h-9 w-9 shrink-0"><Award size={16}/></span>
                    <div>
                      <div className="font-display font-semibold text-ink">{c.certificate_title}</div>
                      <p className="text-xs text-ink/40">{new Date(c.generated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
