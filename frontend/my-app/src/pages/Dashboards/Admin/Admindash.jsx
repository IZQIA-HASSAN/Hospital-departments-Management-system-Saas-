import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "staff", label: "Staff", icon: Users },
  { id: "shifts", label: "Shifts", icon: CalendarClock },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Admindash() {
  const navigate = useNavigate();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const activeLabel = NAV_ITEMS.find((n) => n.id === active)?.label ?? "Dashboard";

  return (
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
            ADMIN
          </span>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActive(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                    isActive
                      ? "bg-emerald-800 text-neutral-50"
                      : "text-emerald-100/70 hover:bg-emerald-900 hover:text-neutral-50"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
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

      {/* Main content */}
      <main className="px-6 sm:px-10 py-10 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
            {activeLabel.toUpperCase()}
          </span>
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl mb-8">
            {user ? `Welcome, ${user.name}.` : "Welcome back."}
          </h1>

          {active === "dashboard" && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="border border-neutral-200 rounded-xl p-6 bg-white">
                <span className="font-mono text-xs tracking-wide text-neutral-500">
                  STAFF ON ROSTER
                </span>
                <p className="font-serif text-3xl font-semibold mt-2">—</p>
                <p className="text-sm opacity-60 mt-1">No staff added yet.</p>
              </div>
              <div className="border border-neutral-200 rounded-xl p-6 bg-white">
                <span className="font-mono text-xs tracking-wide text-neutral-500">
                  SHIFTS TODAY
                </span>
                <p className="font-serif text-3xl font-semibold mt-2">—</p>
                <p className="text-sm opacity-60 mt-1">Nothing scheduled yet.</p>
              </div>
            </div>
          )}

          {active === "staff" && (
            <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
              <p className="font-serif text-xl mb-1">No staff yet</p>
              <p className="text-sm opacity-60">
                Staff accounts created via sign up will show up here.
              </p>
            </div>
          )}

          {active === "shifts" && (
            <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
              <p className="font-serif text-xl mb-1">No shifts scheduled</p>
              <p className="text-sm opacity-60">
                Shifts you create will appear here.
              </p>
            </div>
          )}

          {active === "settings" && (
            <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
              <p className="font-serif text-xl mb-1">Settings</p>
              <p className="text-sm opacity-60">
                Account and ward settings will live here.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}