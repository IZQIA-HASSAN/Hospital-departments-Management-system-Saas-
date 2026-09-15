// Adminsettings.jsx
import { useState } from 'react'
import { Mail, Lock, Building2, ChevronRight } from 'lucide-react'
import Drawer from '../../../components/ui/Drawer'
import ChangeEmailForm from '../../../components/settings/ChangeEmailForm'
import ChangePasswordForm from '../../../components/settings/ChangePasswordForm'
import HospitalInfoForm from '../../../components/settings/HospitalInfoForm'
import { useAuth } from '../../../context/AuthContext'

const SETTINGS_ITEMS = [
  { key: 'email', label: 'Change Email', desc: 'Update the address you sign in with', icon: Mail },
  { key: 'password', label: 'Change Password', desc: 'Update your account password', icon: Lock },
  { key: 'hospital', label: 'Hospital Information', desc: "Manage your hospital's details", icon: Building2 },
]

export default function Adminsettings() {
  const { user } = useAuth()
  const [openDrawer, setOpenDrawer] = useState(null) // null | 'email' | 'password' | 'hospital'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
        {SETTINGS_ITEMS.map(({ key, label, desc, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setOpenDrawer(key)}
            className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <Icon size={18} className="text-emerald-700 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        ))}
      </div>

      <Drawer open={openDrawer === 'email'} onClose={() => setOpenDrawer(null)} title="Change Email">
        <ChangeEmailForm currentEmail={user?.email} />
      </Drawer>

      <Drawer open={openDrawer === 'password'} onClose={() => setOpenDrawer(null)} title="Change Password">
        <ChangePasswordForm />
      </Drawer>

      <Drawer open={openDrawer === 'hospital'} onClose={() => setOpenDrawer(null)} title="Hospital Information">
        <HospitalInfoForm />
      </Drawer>
    </div>
  )
}