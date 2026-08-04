import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, FileBarChart, Settings, ChevronDown, ChevronRight, Search,
  Bell, Circle, Users, BedDouble, Clock, Activity, Stethoscope,
  Shield, Palette, Lock, Building2, LogOut
} from 'lucide-react';

// ---------- Static config (not data — labels, icons, colors) ----------

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileBarChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const DEPT_ICON = {
  'All Departments': Building2,
  ICU: Activity,
  OPD: Stethoscope,
  Emergency: Shield,
  Surgery: Stethoscope,
  Pediatrics: Users,
  Radiology: Activity,
};

const statusColor = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-neutral-400',
};

const SETTINGS_ITEMS = [
  { icon: Building2, title: 'Hospital profile', desc: 'Name, address, and branding shown across reports.' },
  { icon: Users, title: 'Roles & permissions', desc: 'Control what each staff role can view or edit.' },
  { icon: Bell, title: 'Notifications', desc: 'Choose which alerts admins receive and how.' },
  { icon: Lock, title: 'Security', desc: 'Session timeout, login policy, and audit log.' },
  { icon: Palette, title: 'Appearance', desc: 'Theme and dashboard layout preferences.' },
];

// ---------- Small building blocks ----------

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`nav-item group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors w-full ${
        active
          ? 'bg-emerald-50 text-emerald-950 font-medium'
          : 'text-neutral-50/70 hover:bg-emerald-900/60 hover:text-neutral-50'
      }`}
    >
      <Icon size={17} />
      {label}
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="border border-neutral-200 rounded-xl px-5 py-5 bg-white">
      <Icon size={17} className="text-emerald-700 mb-3" />
      <p className="font-serif font-semibold text-2xl leading-none text-neutral-900">
        {value}
      </p>
      <p className="font-mono text-[0.68rem] tracking-wide text-neutral-500 mt-2 uppercase">
        {label}
      </p>
      {sub && <p className="text-xs text-neutral-400 mt-1">{sub}</p>}
    </div>
  );
}

function StaffRow({ person }) {
  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-emerald-900/50 transition-colors">
      <div className="relative shrink-0">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-center justify-center">
          {initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-emerald-950 ${
            statusColor[person.status] || statusColor.offline
          }`}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-neutral-50 truncate">{person.name}</p>
        <p className="text-xs text-neutral-50/60 truncate">
          {person.role} · {person.dept}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-3">
        <Icon size={17} className="text-neutral-400" />
      </div>
      <p className="text-sm font-medium text-neutral-700">{title}</p>
      <p className="text-xs text-neutral-400 mt-1 max-w-xs">{message}</p>
    </div>
  );
}

// ---------- Views ----------

function DashboardView({ adminName, stats, departments, onlineCount }) {
  const hasDepartments = departments.length > 0;
  return (
    <div className="space-y-9">
      <div className="greet">
        <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
        <h1 className="font-serif font-semibold text-3xl text-neutral-900">
          Good morning{adminName ? `, ${adminName}` : ''}.
        </h1>
        <p className="text-neutral-500 mt-1.5">Here's what's happening across the hospital right now.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Staff on duty" value={onlineCount} sub="currently logged in" icon={Users} />
        <StatCard label="Occupied beds" value={stats.beds ?? '—'} icon={BedDouble} />
        <StatCard label="Avg. wait time" value={stats.wait ?? '—'} sub="across OPD & ER" icon={Clock} />
        <StatCard label="Active alerts" value={stats.alerts ?? '—'} icon={Activity} />
      </div>

      <div className="border border-neutral-200 rounded-xl bg-white">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-serif font-semibold text-lg text-neutral-900">Department snapshot</h2>
        </div>
        {hasDepartments ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-5">
            {departments.map((d) => {
              const Icon = DEPT_ICON[d.name] || Building2;
              return (
                <div key={d.name} className="border border-neutral-100 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">{d.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">
                      {d.patients ?? 0} patients · {d.staff ?? 0} staff
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title="No departments yet"
            message="Add departments to see live patient and staffing snapshots here."
          />
        )}
      </div>
    </div>
  );
}

function ReportsView({ dept, setDept, deptOpen, setDeptOpen, departmentNames, deptStats, staff }) {
  const stats = deptStats[dept] || {};
  const filteredStaff = staff.filter((p) => dept === 'All Departments' || p.dept === dept);

  return (
    <div className="space-y-9">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif font-semibold text-3xl text-neutral-900">Department reports</h1>
          <p className="text-neutral-500 mt-1.5">Filter activity and outcomes by department.</p>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setDeptOpen(!deptOpen); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-sm font-medium text-neutral-700 hover:border-emerald-700/40 min-w-[190px] justify-between transition-colors"
          >
            <span className="flex items-center gap-2">
              {React.createElement(DEPT_ICON[dept] || Building2, { size: 15, className: 'text-emerald-700' })}
              {dept}
            </span>
            <ChevronDown size={15} className={`text-neutral-500 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
          </button>
          {deptOpen && (
            <div className="absolute right-0 mt-1.5 w-full bg-white border border-neutral-200 rounded-lg shadow-lg overflow-hidden z-10">
              {departmentNames.map((d) => {
                const Icon = DEPT_ICON[d] || Building2;
                return (
                  <button
                    key={d}
                    onClick={() => { setDept(d); setDeptOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3.5 py-2 text-sm text-left hover:bg-emerald-50 ${
                      d === dept ? 'text-emerald-700 bg-emerald-50 font-medium' : 'text-neutral-700'
                    }`}
                  >
                    <Icon size={14} className={d === dept ? 'text-emerald-700' : 'text-neutral-500'} />
                    {d}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Patients" value={stats.patients ?? '—'} sub="today" icon={Users} />
        <StatCard label="Bed usage" value={stats.beds ?? '—'} icon={BedDouble} />
        <StatCard label="Avg. wait" value={stats.wait ?? '—'} icon={Clock} />
        <StatCard label="Staff assigned" value={stats.staff ?? '—'} sub={stats.trend ? `vs. last week ${stats.trend}` : undefined} icon={Activity} />
      </div>

      <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="font-serif font-semibold text-lg text-neutral-900">Staff assigned — {dept}</h2>
        </div>
        {filteredStaff.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[0.68rem] uppercase tracking-wide text-neutral-400 border-b border-neutral-100">
                <th className="px-5 py-2.5 font-medium">Name</th>
                <th className="px-5 py-2.5 font-medium">Role</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium">Since</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((p) => (
                <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                  <td className="px-5 py-2.5 text-neutral-800">{p.name}</td>
                  <td className="px-5 py-2.5 text-neutral-500">{p.role}</td>
                  <td className="px-5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs capitalize text-neutral-600">
                      <Circle size={7} className={statusColor[p.status] || statusColor.offline} fill="currentColor" strokeWidth={0} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-neutral-500 font-mono text-xs">{p.since}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Users}
            title="No staff assigned"
            message={`No one is currently assigned to ${dept === 'All Departments' ? 'any department' : dept}.`}
          />
        )}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="space-y-9">
      <div>
        <h1 className="font-serif font-semibold text-3xl text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1.5">Manage how the admin dashboard works.</p>
      </div>
      <div className="border border-neutral-200 rounded-xl bg-white divide-y divide-neutral-100">
        {SETTINGS_ITEMS.map((it) => (
          <button
            key={it.title}
            className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
              <it.icon size={16} className="text-emerald-700" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-800">{it.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{it.desc}</p>
            </div>
            <ChevronDown size={16} className="text-neutral-400 -rotate-90 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Main component ----------
// All data comes from props so the shell can be wired up to a real API.
// Every prop defaults to an empty/neutral value — no mock names or numbers.

const AdminDash = ({
  admin = { name: '', initials: 'AD', role: 'Super Admin' },
  hospitalName = 'Your Hospital',
  staff = [],           // [{ id, name, role, dept, status, since }]
  departments = [],      // [{ name, patients, staff }]
  deptStats = {},         // { [departmentName]: { patients, beds, wait, staff, trend } }
  dashboardStats = {},    // { beds, wait, alerts }
}) => {
  const [view, setView] = useState('dashboard');
  const [dept, setDept] = useState('All Departments');
  const [deptOpen, setDeptOpen] = useState(false);
  const [query, setQuery] = useState('');

  const departmentNames = useMemo(
    () => ['All Departments', ...departments.map((d) => d.name)],
    [departments]
  );

  const filteredStaff = useMemo(
    () => staff.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [staff, query]
  );
  const onlineCount = staff.filter((p) => p.status === 'online').length;

  return (
    <div
      className="h-screen w-full flex bg-neutral-50 text-neutral-900"
      onClick={() => deptOpen && setDeptOpen(false)}
    >
      {/* Sidebar */}
      <aside className="sidebar-panel w-72 shrink-0 bg-emerald-950 text-neutral-50 flex flex-col">
        <div className="px-6 py-6 border-b border-emerald-900/80">
          <span className="font-serif font-bold text-xl">{hospitalName}</span>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-emerald-400 mt-1">
            ADMIN CONSOLE
          </p>
        </div>

        <nav className="px-3 py-5 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={view === item.id}
              onClick={() => setView(item.id)}
            />
          ))}
        </nav>

        <div className="px-5 pt-3 pb-2 flex items-center justify-between">
          <p className="font-mono text-[0.65rem] font-semibold text-neutral-50/60 uppercase tracking-[0.14em]">
            Staff logged in
          </p>
          <span className="font-mono text-xs font-medium text-emerald-400">{onlineCount} online</span>
        </div>

        <div className="px-3 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-50/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff"
              className="w-full pl-8 pr-3 py-1.5 bg-emerald-900/60 text-sm text-neutral-50 placeholder-neutral-50/40 rounded-lg outline-none focus:ring-1 focus:ring-emerald-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((p) => <StaffRow key={p.id} person={p} />)
          ) : (
            <p className="text-xs text-neutral-50/40 px-3 py-4">
              {staff.length === 0 ? 'No staff added yet.' : `No staff match "${query}".`}
            </p>
          )}
        </div>

        <div className="sidebar-foot border-t border-emerald-900/80 px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-center justify-center shrink-0">
            {admin.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-neutral-50 truncate">{admin.name || 'Admin'}</p>
            <p className="text-xs text-neutral-50/50 truncate">{admin.role}</p>
          </div>
          <button className="text-neutral-50/40 hover:text-neutral-50 transition-colors shrink-0" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-neutral-200 bg-neutral-50/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <span className="font-mono text-xs tracking-wide text-neutral-400 capitalize">Admin / {view}</span>
          <div className="flex items-center gap-4">
            <button className="relative text-neutral-500 hover:text-neutral-900 transition-colors" aria-label="Notifications">
              <Bell size={17} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
            </button>
            <div className="w-7 h-7 rounded-full bg-emerald-950" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-9 max-w-5xl w-full mx-auto">
          {view === 'dashboard' && (
            <DashboardView
              adminName={admin.name ? admin.name.split(' ')[0] : ''}
              stats={dashboardStats}
              departments={departments}
              onlineCount={onlineCount}
            />
          )}
          {view === 'reports' && (
            <ReportsView
              dept={dept}
              setDept={setDept}
              deptOpen={deptOpen}
              setDeptOpen={setDeptOpen}
              departmentNames={departmentNames}
              deptStats={deptStats}
              staff={staff}
            />
          )}
          {view === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

export default AdminDash;