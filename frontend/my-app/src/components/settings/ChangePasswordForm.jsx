import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { changePassword } from '../../Api/settings_api'

export default function ChangePasswordForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })

  // Independent toggle state for each password field
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [status, setStatus] = useState({ loading: false, error: '', success: '' })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.newPassword !== form.confirmNewPassword) {
      setStatus({ loading: false, error: 'New passwords do not match', success: '' })
      return
    }

    setStatus({ loading: true, error: '', success: '' })

    try {
      // Passes the entire object containing currentPassword, newPassword, confirmNewPassword
      const data = await changePassword(form)
      setStatus({ loading: false, error: '', success: data.message })
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: '' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>

      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
        <div className="relative">
          <input
            type={showPassword.current ? 'text' : 'password'}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            required
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={() => toggleVisibility('current')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword.current ? "Hide current password" : "Show current password"}
          >
            {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
        <div className="relative">
          <input
            type={showPassword.new ? 'text' : 'password'}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={() => toggleVisibility('new')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword.new ? "Hide new password" : "Show new password"}
          >
            {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
        <div className="relative">
          <input
            type={showPassword.confirm ? 'text' : 'password'}
            name="confirmNewPassword"
            value={form.confirmNewPassword}
            onChange={handleChange}
            required
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
          <button
            type="button"
            onClick={() => toggleVisibility('confirm')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={showPassword.confirm ? "Hide confirm password" : "Show confirm password"}
          >
            {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status.error && <p className="text-sm text-red-600">{status.error}</p>}
      {status.success && <p className="text-sm text-green-600">{status.success}</p>}

      <button
        type="submit"
        disabled={status.loading}
        className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status.loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}