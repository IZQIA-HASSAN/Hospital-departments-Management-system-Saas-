import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import {
  Bell,
  LogOut,
  Clock,
  CalendarDays,
  Umbrella,
  Flame,
  MapPin,
  ChevronRight,
  Check,
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  UserRound,
} from "lucide-react";

// ---------- Mock data (swap for real API data later) ----------

const STAFF = {
  name: "Amara Osei",
  role: "Registered Nurse",
  ward: "ICU",
  initials: "AO",
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "schedule", label: "Schedule", icon: CalendarClock },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "profile", label: "Profile", icon: UserRound },
];

const TODAY_SHIFT = {
  time: "07:00 – 15:00",
  ward: "ICU · Bay 3",
  supervisor: "Dr. R. Khan",
};

const STATS = [
  { icon: Clock, label: "Hours this week", value: 32.5, unit: "hrs", decimals: 1 },
  { icon: CalendarDays, label: "Shifts this month", value: 14, unit: "shifts", decimals: 0 },
  { icon: Umbrella, label: "Leave balance", value: 9, unit: "days", decimals: 0 },
  { icon: Flame, label: "Attendance streak", value: 21, unit: "days", decimals: 0 },
];

const UPCOMING = [
  { id: "01", day: "Tomorrow", time: "07:00–15:00", ward: "ICU", note: "Bay 3" },
  { id: "02", day: "Thu, Aug 6", time: "15:00–23:00", ward: "ICU", note: "Bay 1" },
  { id: "03", day: "Sat, Aug 8", time: "23:00–07:00", ward: "ER", note: "Cover shift" },
];

const TEAM_ON_DUTY = [
  { name: "T. Osei", role: "Nurse", ward: "ICU", initials: "TO" },
  { name: "M. Duarte", role: "Nurse", ward: "ICU", initials: "MD" },
  { name: "Dr. R. Khan", role: "Attending", ward: "ICU", initials: "RK" },
  { name: "N. Alvarez", role: "Nurse", ward: "ER", initials: "NA" },
];

// ---------- Small building block: animated count-up number ----------

function StatNumber({ value, decimals }) {
  const ref = useRef(null);

  useEffect(() => {
    const obj = { n: 0 };
    const anim = gsap.to(obj, {
      n: value,
      duration: 1.4,
      delay: 0.5,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) ref.current.textContent = obj.n.toFixed(decimals);
      },
    });
    return () => anim.kill();
  }, [value, decimals]);

  return <span ref={ref}>0</span>;
}

export default function Staffdash() {
  const rootRef = useRef(null);
  const pathRef = useRef(null);
  const btnRef = useRef(null);
  const [clockedIn, setClockedIn] = useState(true);
  const [active, setActive] = useState("dashboard");

  const handleClock = () => {
    setClockedIn((v) => !v);
    gsap.fromTo(
      btnRef.current,
      { scale: 0.94 },
      { scale: 1, duration: 0.35, ease: "elastic.out(1, 0.5)" }
    );
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".sidebar-panel", { x: -24, opacity: 0, duration: 0.6 })
        .from(".nav-item", { x: -12, opacity: 0, duration: 0.4, stagger: 0.06 }, "-=0.35")
        .from(".sidebar-foot", { opacity: 0, duration: 0.4 }, "-=0.2")
        .from(".greet", { y: 14, opacity: 0, duration: 0.5 }, "-=0.5")
        .from(".hero-panel", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".stat-card", { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.35")
        .from(".ghost-card", { y: 14, opacity: 0, duration: 0.45, stagger: 0.06 }, "-=0.3");

      if (pathRef.current) {
        const len = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "power2.inOut",
          delay: 0.5,
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="min-h-screen flex bg-neutral-50 text-neutral-900">
      {/* Sidebar */}
      <aside className="sidebar-panel w-64 shrink-0 bg-emerald-950 text-neutral-50 flex flex-col">
        <div className="px-6 py-6 border-b border-emerald-900/80">
          <span className="font-serif font-bold text-xl">Round</span>
          <p className="font-mono text-[0.65rem] tracking-[0.14em] text-emerald-400 mt-1">
            STAFF PORTAL
          </p>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`nav-item group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                active === item.id
                  ? "bg-emerald-50 text-emerald-950 font-medium"
                  : "text-neutral-50/70 hover:bg-emerald-900/60 hover:text-neutral-50"
              }`}
            >
              <item.icon size={17} />
              {item.label}
              {active === item.id && (
                <ChevronRight size={14} className="ml-auto opacity-50" />
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot px-4 py-5 border-t border-emerald-900/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-950 text-xs font-semibold flex items-center justify-center shrink-0">
            {STAFF.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm truncate">{STAFF.name}</p>
            <p className="text-xs text-neutral-50/50 truncate">{STAFF.role}</p>
          </div>
          <button className="text-neutral-50/40 hover:text-neutral-50 transition-colors shrink-0" aria-label="Log out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="h-16 border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 bg-neutral-50/90 backdrop-blur-sm z-10">
          <span className="font-mono text-xs tracking-wide text-neutral-400 capitalize">
            Staff / {active}
          </span>
          <button className="relative text-neutral-500 hover:text-neutral-900 transition-colors" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>

        <div className="px-8 py-9 max-w-5xl mx-auto space-y-9">
          {/* Greeting */}
          <div className="greet">
            <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl">
              Good morning, {STAFF.name.split(" ")[0]}.
            </h1>
            <p className="text-neutral-500 mt-1.5">{STAFF.role} · {STAFF.ward}</p>
          </div>

          {/* Today's shift — dark hero panel, brand signature */}
          <div className="hero-panel relative overflow-hidden rounded-2xl bg-emerald-950 text-neutral-50 px-8 sm:px-10 py-9">
            <svg
              className="absolute top-1/2 left-0 w-full h-[160px] -translate-y-1/2 opacity-30 pointer-events-none"
              viewBox="0 0 1200 160"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                ref={pathRef}
                d="M0,80 L140,80 L170,30 L200,130 L230,80 L360,80 L390,45 L420,115 L450,80 L600,80 L630,15 L660,145 L690,80 L840,80 L865,62 L890,80 L1050,80 L1075,40 L1100,120 L1125,80 L1200,80"
                fill="none"
                stroke="#34d399"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <span className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-emerald-400 mb-4">
                  <span className={`w-1.5 h-1.5 rounded-full ${clockedIn ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"}`} />
                  {clockedIn ? "ON DUTY NOW" : "TODAY'S SHIFT"}
                </span>
                <h2 className="font-serif font-semibold text-3xl xl:text-4xl mb-3">
                  {TODAY_SHIFT.time}
                </h2>
                <p className="text-neutral-50/60 flex items-center gap-1.5 text-sm">
                  <MapPin size={14} />
                  {TODAY_SHIFT.ward} · Supervising: {TODAY_SHIFT.supervisor}
                </p>
              </div>

              <button
                ref={btnRef}
                onClick={handleClock}
                className={`group shrink-0 px-7 py-3.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  clockedIn
                    ? "bg-neutral-50/10 text-neutral-50 hover:bg-neutral-50/20 border border-neutral-50/20"
                    : "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                }`}
              >
                {clockedIn ? (
                  <>
                    <Check size={16} />
                    Clock out
                  </>
                ) : (
                  <>
                    Clock in
                    <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="stat-card border border-neutral-200 rounded-xl px-5 py-5 bg-white"
              >
                <s.icon size={17} className="text-emerald-700 mb-3" />
                <p className="font-serif font-semibold text-2xl leading-none">
                  <StatNumber value={s.value} decimals={s.decimals} />
                  <span className="text-sm font-sans font-normal text-neutral-400 ml-1">{s.unit}</span>
                </p>
                <p className="font-mono text-[0.68rem] tracking-wide text-neutral-500 mt-2 uppercase">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Two-column: upcoming shifts + team on duty */}
          <div className="grid lg:grid-cols-5 gap-8 pb-4">
            {/* Upcoming shifts */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold text-xl">Upcoming shifts</h3>
                <a href="#" className="text-xs font-mono tracking-wide text-emerald-700 hover:underline flex items-center gap-1">
                  FULL SCHEDULE <ChevronRight size={13} />
                </a>
              </div>
              <div className="flex flex-col gap-3">
                {UPCOMING.map((s) => (
                  <div
                    key={s.id}
                    className="ghost-card flex items-center gap-4 border border-neutral-200 rounded-xl px-5 py-4 bg-white hover:border-emerald-700/40 hover:-translate-y-0.5 transition-all"
                  >
                    <span className="font-mono text-[0.7rem] text-emerald-700 w-6 shrink-0">{s.id}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{s.day}</p>
                      <p className="text-xs text-neutral-500 font-mono mt-0.5">{s.time} · {s.ward} · {s.note}</p>
                    </div>
                    <ChevronRight size={16} className="text-neutral-300 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            {/* Team on duty */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-semibold text-xl">Team on duty</h3>
                <span className="text-xs font-mono tracking-wide text-neutral-400">{TEAM_ON_DUTY.length} NOW</span>
              </div>
              <div className="flex flex-col gap-2 border border-neutral-200 rounded-xl bg-white p-2">
                {TEAM_ON_DUTY.map((p) => (
                  <div
                    key={p.name}
                    className="ghost-card flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-50 text-xs font-semibold flex items-center justify-center">
                        {p.initials}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{p.role} · {p.ward}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}