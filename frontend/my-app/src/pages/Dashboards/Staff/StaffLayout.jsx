import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  CalendarClock,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  ChevronDown,
} from "lucide-react";
import { NotificationProvider } from "../../../context/Notifycontext";
import NotificationBell from "../../../components/NotificationBell";

const DEPARTMENT_OPTIONS = [
  { label: "OPD", slug: "opd" },
  { label: "ICU", slug: "icu" },
  { label: "Emergency", slug: "emergency" },
];

export default function StaffLayout() {
  // useSocketConnection() removed — NotificationProvider below already
  // owns the connect/disconnect lifecycle. Calling it here too would
  // create two competing owners of the same socket instance.
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deptExpanded, setDeptExpanded] = useState(
    location.pathname.includes("/departments/")
  );

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const handleLogout = async () => {
    try {
     const res =  await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
       const data = await res.json().catch(() => ({}));
    console.log("Logout response:", res.status, data);
    } catch (err) {
      console.error("Logout notification failed:", err);
      // proceed with logout regardless — don't block the user from leaving
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("staff has logged-out")
    navigate("/Login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 lg:grid lg:grid-cols-[240px_1fr]">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 lg:hidden">
          <span className="font-serif font-bold text-lg">Round</span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            className="text-neutral-700"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "flex" : "hidden"
          } lg:flex flex-col justify-between bg-emerald-950 text-neutral-50 px-5 py-8 lg:min-h-screen`}
        >
          <div>
            <span className="hidden lg:block font-serif font-bold text-xl mb-10 px-2">
              Round
            </span>

            <span className="block font-mono text-[0.65rem] tracking-[0.14em] text-emerald-400 px-2 mb-3">
              STAFF
            </span>

            <nav className="flex flex-col gap-1">
              <Link
                to="/staff"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive("/staff")
                    ? "bg-emerald-800 text-neutral-50"
                    : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"
                }`}
              >
                <LayoutDashboard size={17} />
                Dashboard
              </Link>

              <div>
                <button
                  onClick={() => setDeptExpanded((v) => !v)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                    location.pathname.includes("/departments/")
                      ? "bg-emerald-800 text-neutral-50"
                      : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <CalendarClock size={17} />
                    Departments
                  </span>
                  <ChevronDown
                    size={15}
                    className={`transition-transform ${deptExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {deptExpanded && (
                  <div className="mt-1 ml-8 flex flex-col gap-0.5">
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <Link
                        key={dept.slug}
                        to={`/staff/departments/${dept.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive(`/staff/departments/${dept.slug}`)
                            ? "text-neutral-50 bg-emerald-900"
                            : "text-emerald-100/60 hover:bg-emerald-900 hover:text-neutral-50"
                        }`}
                      >
                        <Stethoscope size={14} />
                        {dept.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                to="/staff/settings"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive("/staff/settings")
                    ? "bg-emerald-800 text-neutral-50"
                    : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"
                }`}
              >
                <Settings size={17} />
                Settings
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50 transition-colors w-full text-left"
            >
              <LogOut size={17} />
              Log out
            </button>
          </div>
        </aside>

        {/* Routed content */}
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center justify-end border-b border-neutral-100 px-6 py-3">
            <NotificationBell />
          </header>

          <main className="flex-1 px-6 sm:px-10 py-10 lg:py-12">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}