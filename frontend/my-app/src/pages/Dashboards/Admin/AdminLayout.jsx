 import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, Users, CalendarClock, Settings,
  LogOut, Menu, X, Stethoscope, ChevronDown,
} from "lucide-react";

const DEPARTMENT_OPTIONS = [
  { label: "OPD", slug: "opd" },
  { label: "ICU", slug: "icu" },
  { label: "Emergency", slug: "emergency" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deptExpanded, setDeptExpanded] = useState(
    location.pathname.includes("/departments/")
  );

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 lg:grid lg:grid-cols-[240px_1fr]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 lg:hidden">
        <span className="font-serif font-bold text-lg">Round</span>
        <button onClick={() => setSidebarOpen((v) => !v)} className="text-neutral-700">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <aside className={`${sidebarOpen ? "flex" : "hidden"} lg:flex flex-col justify-between bg-emerald-950 text-neutral-50 px-5 py-8 lg:min-h-screen`}>
        <div>
          <span className="hidden lg:block font-serif font-bold text-xl mb-10 px-2">Round</span>
          <span className="block font-mono text-[0.65rem] tracking-[0.14em] text-emerald-400 px-2 mb-3">ADMIN</span>

          <nav className="flex flex-col gap-1">
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive("/admin") ? "bg-emerald-800 text-neutral-50" : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"}`}
            >
              <LayoutDashboard size={17} /> Dashboard
            </Link>

            <Link
              to="/admin/staff"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive("/admin/staff") ? "bg-emerald-800 text-neutral-50" : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"}`}
            >
              <Users size={17} /> Staff
            </Link>

            <div>
              <button
                onClick={() => setDeptExpanded((v) => !v)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${location.pathname.includes("/departments/") ? "bg-emerald-800 text-neutral-50" : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"}`}
              >
                <span className="flex items-center gap-3"><CalendarClock size={17} /> Departments</span>
                <ChevronDown size={15} className={`transition-transform ${deptExpanded ? "rotate-180" : ""}`} />
              </button>
              {deptExpanded && (
                <div className="mt-1 ml-8 flex flex-col gap-0.5">
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <Link
                      key={dept.slug}
                      to={`/admin/departments/${dept.slug}`}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive(`/admin/departments/${dept.slug}`) ? "text-neutral-50 bg-emerald-900" : "text-emerald-100/60 hover:bg-emerald-900 hover:text-neutral-50"}`}
                    >
                      <Stethoscope size={14} /> {dept.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/admin/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive("/admin/settings") ? "bg-emerald-800 text-neutral-50" : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"}`}
            >
              <Settings size={17} /> Settings
            </Link>
          </nav>
        </div>

        <div className="border-t border-emerald-900 pt-5 mt-8">
          {user && (
            <div className="px-2 mb-3">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-emerald-100/50 truncate">{user.title}</p>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50 transition-colors w-full text-left">
            <LogOut size={17} /> Log out
          </button>
        </div>
      </aside>

      <main className="px-6 sm:px-10 py-10 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}