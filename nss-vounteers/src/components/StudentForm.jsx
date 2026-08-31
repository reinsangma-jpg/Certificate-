import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { isValidPhone, isValidRollNo } from '../utils/validation'

const empty = {
  full_name: '', class: '', roll_no: '', phone: '',
  email: '', father_name: '', mother_name: '', photo_path: null
}

export default function StudentForm({ initialProfile, onSaved, mandatory = false }) {
  const [form, setForm] = useState({ ...empty, ...(initialProfile || {}) })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm({ ...empty, ...(initialProfile || {}) })
  }, [initialProfile])

  function change(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function save(e) {
    e.preventDefault()
    setError('')

    if (!form.full_name.trim() || !form.class.trim() || !form.roll_no.trim() ||
        !form.phone.trim() || !form.father_name.trim() || !form.mother_name.trim()) {
      setError('Please complete all required fields.')
      return
    }

    if (!isValidRollNo(form.roll_no)) {
      setError('Roll No must follow the format UA-XX-XXX, for example UA-XX-123.')
      return
    }

    if (!isValidPhone(form.phone)) {
      setError('Please enter a valid phone number.')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You are not logged in.')

      let photoPath = form.photo_path || null

      if (photo) {
        if (!photo.type.startsWith('image/')) throw new Error('Please select an image file.')
        if (photo.size > 5 * 1024 * 1024) throw new Error('Photo must be 5 MB or smaller.')

        const ext = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
        photoPath = `${user.id}/profile.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('student-photos')
          .upload(photoPath, photo, { upsert: true, contentType: photo.type })

        if (uploadError) throw uploadError
      }

      const payload = {
        id: user.id,
        full_name: form.full_name.trim(),
        class: form.class.trim(),
        roll_no: form.roll_no.trim().toUpperCase(),
        phone: form.phone.trim(),
        email: user.email || form.email,
        father_name: form.father_name.trim(),
        mother_name: form.mother_name.trim(),
        photo_path: photoPath,
      }

      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .single()

      if (upsertError) throw upsertError
      onSaved(data)
    } catch (err) {
      setError(err.message || 'Could not save your details.')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    ['full_name', 'Full Name'],
    ['roll_no', 'Roll No'],
    ['phone', 'Phone Number'],
    ['father_name', "Father's Name"],
    ['mother_name', "Mother's Name"],
  ]

  return (
    <form onSubmit={save} className="card p-6">
      {mandatory && (
        <div className="mb-6 rounded-2xl bg-marigold/15 p-4 text-sm text-ink/70">
          Complete your student details before using the NSS portal.
        </div>
      )}

      {error && <div className="mb-5 rounded-2xl bg-coral/10 p-4 text-sm font-semibold text-coral">{error}</div>}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map(([name, label]) => (
          <label key={name} className="text-sm font-semibold text-ink/60">
            {label}
            <input className="input mt-2" name={name} value={form[name] || ''} onChange={change} />
          </label>
        ))}

        <label className="text-sm font-semibold text-ink/60">
          Class
          <select className="input mt-2" name="class" value={form.class || ''} onChange={change}>
            <option value="">Select class</option>
            <option>H.S</option>
            <option>B.A 1st Semester</option>
            <option>B.A 3rd Semester</option>
            <option>B.A 5th Semester</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-ink/60">
          Email
          <input className="input mt-2 opacity-60" value={form.email || ''} disabled />
        </label>

        <label className="text-sm font-semibold text-ink/60 sm:col-span-2">
          Photo for ID card
          <input
            className="mt-2 block w-full rounded-2xl bg-cream p-3 text-sm"
            type="file"
            accept="image/*"
            onChange={e => setPhoto(e.target.files?.[0] || null)}
          />
          <span className="mt-1 block text-xs font-normal text-ink/40">Maximum 5 MB.</span>
        </label>
      </div>

      <button disabled={saving} className="primary mt-7 w-full">
        {saving ? 'Saving…' : 'Save details'}
      </button>
    </form>
  )
}
