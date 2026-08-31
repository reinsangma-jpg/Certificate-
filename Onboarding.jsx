import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import StudentForm from '../components/StudentForm'

export default function Onboarding() {
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-7 text-center sm:text-left">
          <span className="chip bg-coral/15 text-coral">First login</span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Let's set up your student profile</h1>
          <p className="mt-1 text-ink/50">Just a few details and your NSS portal is ready to go.</p>
        </div>
        {!saved ? (
          <StudentForm initialProfile={{}} mandatory onSaved={() => setSaved(true)} />
        ) : (
          <div className="card animate-pop p-8 text-center">
            <div className="seal mx-auto mb-4 h-14 w-14"><PartyPopper size={22}/></div>
            <h2 className="font-display text-2xl font-semibold text-ink">Profile completed!</h2>
            <p className="mt-2 text-ink/50">Your NSS portal is ready.</p>
            <button className="primary mt-6" onClick={() => navigate('/dashboard')}>Go to dashboard</button>
          </div>
        )}
      </div>
    </main>
  )
}
