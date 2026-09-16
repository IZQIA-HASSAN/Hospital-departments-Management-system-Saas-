import { useState } from 'react'
import { changeEmail } from '../../Api/settings_api'

export default function ChangeEmailForm({ currentEmail }) {
  const [oldEmail, setOldEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ loading: true, error: '', success: '' })
    try {
      const data = await changeEmail({ oldEmail, password, newEmail })
      setStatus({ loading: false, error: '', success: data.message })
      setOldEmail('')
      setPassword('')
      setNewEmail('')
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">Change Email</h3>
      {currentEmail && <p className="text-sm text-gray-500">Current: {currentEmail}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current email</label>
        <input
          type="email"
          value={oldEmail}
          onChange={(e) => setOldEmail(e.target.value)}
          required
          autoComplete="username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New email</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
      </div>

      {status.error && <p className="text-sm text-red-600">{status.error}</p>}
      {status.success && <p className="text-sm text-green-600">{status.success}</p>}

      <button
        type="submit"
        disabled={status.loading}
        className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status.loading ? 'Updating...' : 'Update Email'}
      </button>
    </form>
  )
}