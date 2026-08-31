import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Award, Home, LogOut, Menu, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Layout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  async function logout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const nav = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/profile', label: 'Profile', icon: UserRound },
    { to: '/generate-certificate', label: 'Certificates', icon: Award },
  ]

  return (
    <div className="app-shell">
      <aside className={`${open ? 'block' : 'hidden'} fixed inset-0 z-40 w-72 p-5 md:static md:block md:w-auto`}>
        <div className="card flex h-full flex-col p-5">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="seal h-10 w-10 text-xs font-display font-bold">NSS</span>
              <span className="font-display text-lg font-semibold text-ink">Volunteers</span>
            </Link>
            <button className="secondary md:hidden" onClick={() => setOpen(false)}><X size={18}/></button>
          </div>
          <nav className="mt-8 space-y-2">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive ? 'bg-coral text-white shadow-puff-sm' : 'text-ink/60 hover:bg-cream'
                  }`
                }
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}
          </nav>
          <button onClick={logout} className="secondary mt-auto flex items-center justify-center gap-2 text-sm text-ink/70">
            <LogOut size={17}/> Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between bg-cream/90 px-5 py-4 backdrop-blur">
          <button className="secondary md:hidden" onClick={() => setOpen(true)}><Menu size={19}/></button>
          <div className="ml-auto chip bg-white/70 text-ink/60">
            🎗️ NSS Volunteer Portal
          </div>
        </header>
        <div className="mx-auto max-w-6xl p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
