import { useState } from 'react'
import { changePassword } from '../../Api/settings_api'

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ loading: false, error: 'New passwords do not match', success: '' })
      return
    }
    setStatus({ loading: true, error: '', success: '' })
    try {
      const data = await changePassword(form.currentPassword, form.newPassword)
      setStatus({ loading: false, error: '', success: data.message })
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
        <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} required minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600" />
      </div>
      {status.error && <p className="text-sm text-red-600">{status.error}</p>}
      {status.success && <p className="text-sm text-green-600">{status.success}</p>}
      <button type="submit" disabled={status.loading}
        className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed">
        {status.loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}