import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, FileBarChart, Settings, ChevronDown, Search,
  Bell, Circle, Users, BedDouble, Clock, Activity, Stethoscope,
  Shield, Palette, Lock, Building2, LogOut
} from 'lucide-react';

// ---------- Mock data ----------

const STAFF = [
  { id: 1, name: 'Dr. Amara Chen', role: 'Attending Physician', dept: 'ICU', status: 'online', since: '7:02 AM' },
  { id: 2, name: 'Rajesh Kumar', role: 'Charge Nurse', dept: 'ICU', status: 'online', since: '6:45 AM' },
  { id: 3, name: 'Dr. Fatima Noor', role: 'Resident', dept: 'OPD', status: 'online', since: '8:10 AM' },
  { id: 4, name: 'Liam O\u2019Connor', role: 'Nurse', dept: 'Emergency', status: 'away', since: '5:30 AM' },
  { id: 5, name: 'Dr. Priya Sharma', role: 'Consultant', dept: 'Surgery', status: 'online', since: '6:58 AM' },
  { id: 6, name: 'Kenji Watanabe', role: 'Lab Technician', dept: 'Radiology', status: 'offline', since: '4:15 AM' },
  { id: 7, name: 'Grace Mensah', role: 'Nurse', dept: 'Pediatrics', status: 'online', since: '7:20 AM' },
  { id: 8, name: 'Dr. Omar Haddad', role: 'Attending Physician', dept: 'OPD', status: 'away', since: '8:00 AM' },
];

const DEPARTMENTS = ['All Departments', 'ICU', 'OPD', 'Emergency', 'Surgery', 'Pediatrics', 'Radiology'];

const DEPT_STATS = {
  'All Departments': { patients: 214, beds: '178/210', wait: '22 min', staff: 46, trend: '+4%' },
  'ICU': { patients: 18, beds: '18/20', wait: '—', staff: 9, trend: '+1%' },
  'OPD': { patients: 96, beds: '—', wait: '31 min', staff: 12, trend: '+9%' },
  'Emergency': { patients: 27, beds: '22/30', wait: '14 min', staff: 8, trend: '-3%' },
  'Surgery': { patients: 11, beds: '11/14', wait: '—', staff: 7, trend: '0%' },
  'Pediatrics': { patients: 34, beds: '30/40', wait: '18 min', staff: 6, trend: '+2%' },
  'Radiology': { patients: 28, beds: '—', wait: '9 min', staff: 4, trend: '-1%' },
};

const DEPT_ICON = {
  'All Departments': Building2,
  'ICU': Activity,
  'OPD': Stethoscope,
  'Emergency': Shield,
  'Surgery': Stethoscope,
  'Pediatrics': Users,
  'Radiology': Activity,
};

const statusColor = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-slate-400',
};

// ---------- Small building blocks ----------

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-green-700 text-white'
          : 'text-green-100 hover:bg-green-800/60 hover:text-white'
      }`}
    >
      <Icon size={18} strokeWidth={2} className="text-white" />
      {label}
    </button>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
  );
}

function StaffRow({ person }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-green-800/50 transition-colors">
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-semibold text-black">
          {person.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-green-900 ${statusColor[person.status]}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate">{person.name}</p>
        <p className="text-xs text-green-200/80 truncate">{person.role} · {person.dept}</p>
      </div>
    </div>
  );
}

// ---------- Views ----------

function DashboardView({ onlineCount }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Good morning, Admin</h1>
        <p className="text-sm text-slate-500 mt-0.5">Here's what's happening across the hospital right now.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Staff on duty" value={onlineCount} sub="currently logged in" icon={Users} accent="bg-teal-600" />
        <StatCard label="Occupied beds" value="178 / 210" sub="85% capacity" icon={BedDouble} accent="bg-indigo-500" />
        <StatCard label="Avg. wait time" value="22 min" sub="across OPD & ER" icon={Clock} accent="bg-amber-500" />
        <StatCard label="Active alerts" value="3" sub="2 ICU, 1 Pharmacy" icon={Activity} accent="bg-rose-500" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Department snapshot</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DEPARTMENTS.filter(d => d !== 'All Departments').map((d) => {
            const s = DEPT_STATS[d];
            const Icon = DEPT_ICON[d];
            return (
              <div key={d} className="border border-slate-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-black" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{d}</p>
                  <p className="text-xs text-slate-400">{s.patients} patients · {s.staff} staff</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReportsView({ dept, setDept, deptOpen, setDeptOpen }) {
  const stats = DEPT_STATS[dept];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Department reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Filter activity and outcomes by department.</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setDeptOpen(!deptOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-400 min-w-[190px] justify-between"
          >
            <span className="flex items-center gap-2">
              {React.createElement(DEPT_ICON[dept], { size: 15, className: 'text-black' })}
              {dept}
            </span>
            <ChevronDown size={15} className={`text-black transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
          </button>
          {deptOpen && (
            <div className="absolute right-0 mt-1.5 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-10">
              {DEPARTMENTS.map((d) => {
                const Icon = DEPT_ICON[d];
                return (
                  <button
                    key={d}
                    onClick={() => { setDept(d); setDeptOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left hover:bg-green-50 ${
                      d === dept ? 'text-green-700 bg-green-50 font-medium' : 'text-black'
                    }`}
                  >
                    <Icon size={14} className={d === dept ? 'text-green-700' : 'text-black'} />
                    {d}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients" value={stats.patients} sub="today" icon={Users} accent="bg-teal-600" />
        <StatCard label="Bed usage" value={stats.beds} icon={BedDouble} accent="bg-indigo-500" />
        <StatCard label="Avg. wait" value={stats.wait} icon={Clock} accent="bg-amber-500" />
        <StatCard label="Staff assigned" value={stats.staff} sub={`vs. last week ${stats.trend}`} icon={Activity} accent="bg-rose-500" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Staff assigned — {dept}</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
              <th className="px-5 py-2.5 font-medium">Name</th>
              <th className="px-5 py-2.5 font-medium">Role</th>
              <th className="px-5 py-2.5 font-medium">Status</th>
              <th className="px-5 py-2.5 font-medium">Since</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.filter(p => dept === 'All Departments' || p.dept === dept).map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-2.5 text-slate-800">{p.name}</td>
                <td className="px-5 py-2.5 text-slate-500">{p.role}</td>
                <td className="px-5 py-2.5">
                  <span className="inline-flex items-center gap-1.5 text-xs capitalize text-slate-600">
                    <Circle size={7} className={`${statusColor[p.status]} rounded-full`} fill="currentColor" strokeWidth={0} />
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-slate-500">{p.since}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView() {
  const items = [
    { icon: Building2, title: 'Hospital profile', desc: 'Name, address, and branding shown across reports.' },
    { icon: Users, title: 'Roles & permissions', desc: 'Control what each staff role can view or edit.' },
    { icon: Bell, title: 'Notifications', desc: 'Choose which alerts admins receive and how.' },
    { icon: Lock, title: 'Security', desc: 'Session timeout, login policy, and audit log.' },
    { icon: Palette, title: 'Appearance', desc: 'Theme and dashboard layout preferences.' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage how the admin dashboard works.</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <it.icon size={16} className="text-black" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800">{it.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{it.desc}</p>
            </div>
            <ChevronDown size={16} className="text-black -rotate-90 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Main component ----------

const AdminDash = () => {
  const [view, setView] = useState('dashboard');
  const [dept, setDept] = useState('All Departments');
  const [deptOpen, setDeptOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredStaff = useMemo(
    () => STAFF.filter(p => p.name.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const onlineCount = STAFF.filter(p => p.status === 'online').length;

  return (
    <div className="h-screen w-full flex bg-slate-50 text-slate-900 font-sans" onClick={() => deptOpen && setDeptOpen(false)}>
      {/* Sidebar */}
      <aside className="w-72 bg-green-900 flex flex-col shrink-0">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-green-800">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <Activity size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Meridian Health</p>
            <p className="text-xs text-green-200/80 leading-tight">Admin Console</p>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={FileBarChart} label="Reports" active={view === 'reports'} onClick={() => setView('reports')} />
          <NavItem icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
        </nav>

        <div className="px-5 pt-2 pb-2 flex items-center justify-between">
          <p className="text-xs font-semibold text-green-200/80 uppercase tracking-wide">Staff logged in</p>
          <span className="text-xs font-medium text-green-300">{onlineCount} online</span>
        </div>

        <div className="px-3 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff"
              className="w-full pl-8 pr-3 py-1.5 bg-green-800/60 text-sm text-white placeholder-green-200/70 rounded-lg outline-none focus:ring-1 focus:ring-green-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {filteredStaff.map((p) => (
            <StaffRow key={p.id} person={p} />
          ))}
          {filteredStaff.length === 0 && (
            <p className="text-xs text-slate-500 px-3 py-4">No staff match "{query}".</p>
          )}
        </div>

        <div className="border-t border-green-800 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-xs font-semibold text-white shrink-0">
            AD
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">Admin User</p>
            <p className="text-xs text-green-200/70 truncate">Super Admin</p>
          </div>
          <LogOut size={15} className="text-green-200/80 hover:text-white cursor-pointer shrink-0" />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
          <p className="text-sm text-slate-400 capitalize">Admin / {view}</p>
          <div className="flex items-center gap-4">
            <Bell size={17} className="text-black hover:text-green-700 cursor-pointer" />
            <div className="w-7 h-7 rounded-full bg-black" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'dashboard' && <DashboardView onlineCount={onlineCount} />}
          {view === 'reports' && (
            <ReportsView dept={dept} setDept={setDept} deptOpen={deptOpen} setDeptOpen={setDeptOpen} />
          )}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

export default AdminDash;