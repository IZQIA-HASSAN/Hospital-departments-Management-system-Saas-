import { useState, useEffect } from 'react'
import { getMyHospital   , updateHospital} from '../../Api/settings_api'

export default function HospitalInfoForm() {
  const [hospital, setHospital] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [form, setForm] = useState({ name: '', address: '', city: '', phone: '' })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  useEffect(() => {
    let cancelled = false
    getMyHospital()
      .then((h) => {
        if (cancelled) return
        setHospital(h)
        if (h) setForm({ name: h.name || '', address: h.address || '', city: h.city || '', phone: h.phone || '' })
      })
      .catch((err) => { if (!cancelled) setLoadError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: '', success: '' })
    try {
      if (hospital) {
        const data = await updateHospital(form)
        setStatus({ loading: false, error: '', success: data.message || 'Hospital info updated' })
      } else {
        const created = await createHospital(form)
        setHospital(created)
        setStatus({ loading: false, error: '', success: 'Hospital created' })
      }
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' })
    }
  }

  const fields = [
    { name: 'name', label: 'Hospital Name' },
    { name: 'address', label: 'Address' },
    { name: 'city', label: 'City' },
    { name: 'phone', label: 'Phone' },
  ]

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-gray-500">Loading hospital info...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm text-red-600">{loadError}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">
        {hospital ? 'Hospital Information' : 'Set Up Your Hospital'}
      </h3>
      {!hospital && (
        <p className="text-sm text-gray-500">You haven't created a hospital yet — fill this in to get started.</p>
      )}
      {fields.map(({ name, label }) => (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          <input type="text" name={name} value={form[name]} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600" />
        </div>
      ))}
      {status.error && <p className="text-sm text-red-600">{status.error}</p>}
      {status.success && <p className="text-sm text-green-600">{status.success}</p>}
      <button type="submit" disabled={status.loading}
        className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed">
        {status.loading ? 'Saving...' : hospital ? 'Save Changes' : 'Create Hospital'}
      </button>
    </form>
  )
}