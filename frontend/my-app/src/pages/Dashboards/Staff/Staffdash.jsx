import { useMemo, useState } from "react";
import {
  Search,
  Phone,
  Mail,
  Stethoscope,
  BriefcaseMedical,
  Users,
  LayoutDashboard,
  UserPlus,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Plug in your real data here:
//  - DEPARTMENTS: list of departments used for the filter pills + tag colors.
//    `tone` picks a color from TONE_MAP below (add more tones there if needed).
//  - staff: pass an array of records via the `staff` prop, each shaped like:
//    { id, name, role, dept, years, onDuty, phone, email }
//    (dept must match a DEPARTMENTS id). Wire this up to your API/database.
// ---------------------------------------------------------------------------
const DEPARTMENTS = [
  { id: "cardiology", label: "Cardiology", tone: "rose" },
  { id: "emergency", label: "Emergency Medicine", tone: "amber" },
  { id: "pediatrics", label: "Pediatrics", tone: "teal" },
  { id: "surgery", label: "Surgery", tone: "indigo" },
  { id: "radiology", label: "Radiology", tone: "slate" },
  { id: "neurology", label: "Neurology", tone: "violet" },
  { id: "oncology", label: "Oncology", tone: "amber" },
  { id: "nursing", label: "Nursing", tone: "teal" },
  { id: "pharmacy", label: "Pharmacy", tone: "rose" },
  { id: "admin", label: "Administration", tone: "slate" },
];

const TONE_MAP = {
  rose: { bg: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", chip: "bg-rose-100 text-rose-800" },
  amber: { bg: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", chip: "bg-amber-100 text-amber-800" },
  teal: { bg: "bg-teal-600", soft: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-200", chip: "bg-teal-100 text-teal-800" },
  indigo: { bg: "bg-indigo-600", soft: "bg-indigo-50", text: "text-indigo-700", ring: "ring-indigo-200", chip: "bg-indigo-100 text-indigo-800" },
  slate: { bg: "bg-slate-600", soft: "bg-slate-50", text: "text-slate-700", ring: "ring-slate-200", chip: "bg-slate-100 text-slate-800" },
  violet: { bg: "bg-violet-600", soft: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", chip: "bg-violet-100 text-violet-800" },
};

const NAV_ITEMS = [
  { id: "staff", label: "Staff", icon: Users },
  { id: "register", label: "Register Patient", icon: UserPlus },
  { id: "history", label: "History", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

function initials(name) {
  return name
    .replace("Dr. ", "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StaffCard({ person }) {
  const dept = DEPARTMENTS.find((d) => d.id === person.dept);
  const tone = TONE_MAP[dept.tone];

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* lanyard punch */}
      <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 w-5 h-5 rounded-full bg-slate-100 border border-slate-200" />

      <div className={`h-2 rounded-t-2xl ${tone.bg}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-xl ${tone.bg} text-white flex items-center justify-center font-semibold text-lg tracking-wide ring-4 ${tone.ring}`}
          >
            {initials(person.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 truncate">{person.name}</h3>
              <span
                className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
                  person.onDuty ? "bg-emerald-500" : "bg-slate-300"
                }`}
                title={person.onDuty ? "On duty" : "Off duty"}
              />
            </div>
            <p className="text-sm text-slate-500 truncate">{person.role}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${tone.chip}`}>
            {dept.label}
          </span>
          <span className="text-xs font-mono text-slate-400">{person.id}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{person.years} yrs experience</span>
          <div className="flex items-center gap-3">
            <a href={`tel:${person.phone}`} className="hover:text-teal-700 transition-colors" title={person.phone}>
              <Phone size={14} />
            </a>
            <a href={`mailto:${person.email}`} className="hover:text-teal-700 transition-colors" title={person.email}>
              <Mail size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ collapsed, onToggle, active = "staff" }) {
  return (
    <aside
      className={`hidden sm:flex flex-col shrink-0 bg-teal-950 text-teal-100 min-h-screen sticky top-0 transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-2 px-5 h-16 border-b border-teal-800/60">
        <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0">
          <Stethoscope size={18} />
        </div>
        {!collapsed && (
          <span className="font-semibold text-white tracking-tight truncate">Meridian</span>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        <div className="flex items-center gap-2 px-2 py-2 text-teal-400/80">
          <LayoutDashboard size={16} />
          {!collapsed && <span className="text-xs font-medium uppercase tracking-wide">Menu</span>}
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-500 text-white"
                  : "text-teal-100 hover:bg-teal-900/70"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 h-12 border-t border-teal-800/60 text-teal-300 hover:text-white hover:bg-teal-900/70 transition-colors text-sm"
      >
        {collapsed ? <ChevronRight size={16} /> : (
          <>
            <ChevronLeft size={16} />
            <span>Collapse</span>
          </>
        )}
      </button>
    </aside>
  );
}

function PulseDivider() {
  return (
    <div className="w-full flex items-center justify-center py-6 select-none">
      <svg width="100%" height="24" viewBox="0 0 400 24" className="max-w-3xl text-slate-200" preserveAspectRatio="none">
        <polyline
          points="0,12 140,12 158,2 172,22 186,4 200,12 400,12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function StaffPage({ staff = [] }) {
  const [query, setQuery] = useState("");
  const [activeDept, setActiveDept] = useState("all");
  const [collapsed, setCollapsed] = useState(false);

  const filtered = useMemo(() => {
    return staff.filter((p) => {
      const matchesDept = activeDept === "all" || p.dept === activeDept;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      return matchesDept && matchesQuery;
    });
  }, [staff, query, activeDept]);

  const onDutyCount = staff.filter((p) => p.onDuty).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} active="staff" />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-teal-900 text-white">
          <div className="max-w-6xl mx-auto px-6 pt-14 pb-10">
            <div className="flex items-center gap-2 text-teal-300 text-sm font-medium tracking-wide uppercase mb-3">
              <Stethoscope size={16} />
              <span>Meridian General Hospital</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Our Staff</h1>
            <p className="mt-3 text-teal-100 max-w-xl">
              Find the physicians, nurses, and specialists caring for our patients — search by
              name or filter by department.
            </p>

            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-teal-300" />
                <span className="text-teal-100">{staff.length} staff members</span>
              </div>
              <div className="flex items-center gap-2">
                <BriefcaseMedical size={16} className="text-teal-300" />
                <span className="text-teal-100">{DEPARTMENTS.length} departments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-teal-100">{onDutyCount} on duty now</span>
              </div>
            </div>
          </div>
        </header>

        <PulseDivider />

        {/* Controls */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, role, or staff ID..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveDept("all")}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeDept === "all"
                  ? "bg-teal-900 text-white border-teal-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
              }`}
            >
              All Departments
            </button>
            {DEPARTMENTS.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDept(d.id)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  activeDept === d.id
                    ? "bg-teal-900 text-white border-teal-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {staff.length === 0 ? (
            <div className="text-center py-24 text-slate-500 border border-dashed border-slate-300 rounded-2xl mb-20">
              <Users size={28} className="mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-600">No staff data connected yet</p>
              <p className="text-sm mt-1 max-w-sm mx-auto">
                Pass a <code className="px-1 py-0.5 bg-slate-100 rounded text-xs">staff</code> array
                into <code className="px-1 py-0.5 bg-slate-100 rounded text-xs">&lt;StaffPage /&gt;</code>,
                or wire this component up to your staff API.
              </p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {filtered.map((person) => (
                <StaffCard key={person.id} person={person} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="font-medium">No staff match that search.</p>
              <p className="text-sm mt-1">Try a different name, role, or department.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}