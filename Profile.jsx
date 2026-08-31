import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import StudentForm from '../components/StudentForm'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    setProfile(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  if (loading) return <div className="py-16 text-center font-semibold text-ink/50">Loading…</div>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <span className="chip bg-teal/15 text-teal">Profile</span>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Your student details</h1>
        <p className="mt-1 text-ink/50">Update your information anytime.</p>
      </div>
      <StudentForm initialProfile={profile || { email: user.email }} onSaved={setProfile} />
      {profile && (
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-semibold text-teal">
          <CheckCircle2 size={16} /> Changes are saved to your account.
        </p>
      )}
    </div>
  )
}
