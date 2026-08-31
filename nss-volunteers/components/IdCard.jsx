import { useEffect, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, FileDown } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function IdCard({ profile }) {
  const [photoUrl, setPhotoUrl] = useState('')

  useEffect(() => {
    let active = true
    async function loadPhoto() {
      if (!profile?.photo_path) {
        setPhotoUrl('')
        return
      }
      const { data, error } = await supabase.storage
        .from('student-photos')
        .createSignedUrl(profile.photo_path, 3600)
      if (!error && active) setPhotoUrl(data.signedUrl)
    }
    loadPhoto()
    return () => { active = false }
  }, [profile?.photo_path])

  async function download(type) {
    const element = document.getElementById('nss-id-card')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' })
    const data = canvas.toDataURL('image/png')

    if (type === 'image') {
      const a = document.createElement('a')
      a.href = data
      a.download = `${profile.full_name || 'nss-id-card'}.png`
      a.click()
      return
    }

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] })
    pdf.addImage(data, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`${profile.full_name || 'nss-id-card'}.pdf`)
  }

  return (
    <div>
      <div id="nss-id-card" className="card stamp-border relative mx-auto max-w-3xl overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-marigold/15" />
        <div className="flex items-center gap-4 border-b-2 border-dashed border-coral/30 pb-4">
          <div className="seal h-14 w-14 text-xs font-display font-bold">NSS</div>
          <div>
            <p className="text-xs font-semibold text-teal">National Service Scheme</p>
            <h2 className="font-display text-xl font-semibold text-ink">Volunteer Identity Card</h2>
          </div>
        </div>

        <div className="grid gap-6 py-6 sm:grid-cols-[150px_1fr]">
          <div className="stamp-border overflow-hidden rounded-2xl bg-cream aspect-[4/5]">
            {photoUrl ? (
              <img src={photoUrl} alt="Student" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-center text-xs font-semibold text-ink/30">PHOTO</div>
            )}
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            {[
              ['Full Name', profile.full_name],
              ['Class', profile.class],
              ['Roll No', profile.roll_no],
              ['Phone', profile.phone],
              ['Email', profile.email],
              ["Father's Name", profile.father_name],
              ["Mother's Name", profile.mother_name],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-cream p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/35">{label}</p>
                <p className="mt-1 break-words font-semibold text-ink">{value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button className="primary flex items-center gap-2" onClick={() => download('pdf')}><FileDown size={17}/> Download PDF</button>
        <button className="secondary flex items-center gap-2" onClick={() => download('image')}><Download size={17}/> Download image</button>
      </div>
    </div>
  )
}
