import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
// ADDED: import the Staff component
import Staff from "./Staff";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "staff", label: "Staff", icon: Users },
  { id: "shifts", label: "Shifts", icon: CalendarClock },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Admindash() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [active, setActive] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // boolean: is the create-hospital form currently showing
  const [showhospitalform, setShowHospitalForm] = useState(false);

  // object: the actual form field values
  const [hospitalform, setHospitalForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // fetching admins hospital
  // Fetch the admin's hospital (null if not created yet)
  const hospitalQuery = useQuery({
    queryKey: ["myhospital"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/hospitals/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load hospital");
      return data.hospital;
    },
    staleTime: 5 * 60 * 1000,
  });

  const onChange = (e) => {
    setHospitalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // create a hospital if not exists one
  const createhospital = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("http://localhost:5000/api/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create hospital");
      return data.hospital;
    },
    onSuccess: () => {
      setShowHospitalForm(false);
      queryClient.invalidateQueries({ queryKey: ["myhospital"] });
    },
  });

  // inviting staff member 

  const inviteStaffMutation = useMutation({
    mutationFn: async (email) => {
      const res = await fetch("http://localhost:5000/api/staff/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send invite");
      return data;
    },
    onSuccess: () => {
      navigate("/invite-sent", { state: { email: inviteEmail } });
    },
  });

  const onInviteSubmit = (e) => {
    e.preventDefault();
    inviteStaffMutation.mutate(inviteEmail);
  };

  const onHospitalSubmit = (e) => {
    e.preventDefault();
    createhospital.mutate(hospitalform);
  };

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
        className={`${sidebarOpen ? "flex" : "hidden"
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${isActive
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
            <>
              {/* Hospital status banner */}
              {hospitalQuery.isLoading && (
                <p className="text-sm opacity-60 mb-6">Checking hospital setup…</p>
              )}

              {hospitalQuery.isError && (
                <p className="text-sm text-red-600 mb-6">{hospitalQuery.error.message}</p>
              )}

              {hospitalQuery.data === null && !showhospitalform && (
                <div className="border border-dashed border-emerald-300 bg-emerald-50 rounded-xl p-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="text-emerald-700 mt-0.5" size={22} />
                    <div>
                      <p className="font-serif text-lg font-semibold">No hospital set up yet</p>
                      <p className="text-sm opacity-60">
                        Create your hospital to start adding staff and shifts.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHospitalForm(true)}
                    className="bg-emerald-700 text-neutral-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
                  >
                    Create Hospital
                  </button>
                </div>
              )}

              {hospitalQuery.data === null && showhospitalform && (
                <form
                  onSubmit={onHospitalSubmit}
                  className="border border-neutral-200 rounded-xl p-6 bg-white mb-8 flex flex-col gap-5"
                >
                  <p className="font-serif text-lg font-semibold">Create your hospital</p>

                  {createhospital.isError && (
                    <p className="text-sm text-red-600">{createhospital.error.message}</p>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="font-mono text-xs tracking-wide text-neutral-500">
                      HOSPITAL NAME
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={hospitalform.name}
                      onChange={onChange}
                      placeholder="St. Mary's General"
                      className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="address" className="font-mono text-xs tracking-wide text-neutral-500">
                        ADDRESS
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        value={hospitalform.address}
                        onChange={onChange}
                        placeholder="221B Baker Street"
                        className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="city" className="font-mono text-xs tracking-wide text-neutral-500">
                        CITY
                      </label>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={hospitalform.city}
                        onChange={onChange}
                        placeholder="Rawalpindi"
                        className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="font-mono text-xs tracking-wide text-neutral-500">
                      PHONE (OPTIONAL)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={hospitalform.phone}
                      onChange={onChange}
                      placeholder="051 1234567"
                      className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={createhospital.isPending}
                      className="bg-emerald-700 text-neutral-50 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60"
                    >
                      {createhospital.isPending ? "Creating…" : "Create Hospital"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowHospitalForm(false)}
                      className="px-6 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {hospitalQuery.data && (
                <div className="border border-neutral-200 rounded-xl p-6 bg-white mb-8 flex items-start gap-3">
                  <Building2 className="text-emerald-700 mt-0.5" size={22} />
                  <div>
                    <p className="font-serif text-lg font-semibold">{hospitalQuery.data.name}</p>
                    <p className="text-sm opacity-60">
                      {hospitalQuery.data.address}, {hospitalQuery.data.city}
                    </p>
                    {hospitalQuery.data.phone && (
                      <p className="text-sm opacity-60">{hospitalQuery.data.phone}</p>
                    )}
                  </div>
                </div>
              )}

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
            </>
          )}

          {/* CHANGED: was a static "No staff yet" placeholder block — now
              renders the real Staff component (list, add, delete, live
              online/offline status). */}
          {active === "staff" && (
              <>
    <div className="border border-neutral-200 rounded-xl p-6 bg-white mb-6">
      <p className="font-serif text-lg font-semibold mb-4">Invite a staff member</p>

      {inviteStaffMutation.isError && (
        <p className="text-sm text-red-600 mb-3">{inviteStaffMutation.error.message}</p>
      )}

      <form onSubmit={onInviteSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          required
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="staff@example.com"
          className="flex-1 bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
        />
        <button
          type="submit"
          disabled={inviteStaffMutation.isPending}
          className="bg-emerald-700 text-neutral-50 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {inviteStaffMutation.isPending ? "Sending…" : "Send Invite"}
        </button>
      </form>
    </div>

    <Staff />
  </>
          )}

          {active === "shifts" && (
            <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
              <p className="font-serif text-xl mb-1">No shifts scheduled</p>
              <p className="text-sm opacity-60">Shifts you create will appear here.</p>
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