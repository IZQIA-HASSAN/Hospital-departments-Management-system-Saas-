import React, { useState } from "react";
import {  Clock, CalendarCheck } from "lucide-react";

export default function StaffDash() {
  const [showNotifications, setShowNotifications] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // TODO: replace with real notifications data later
  const notifications = [];

  // NOTE: socket connection management was removed from here entirely.
  // It now lives solely in StaffLayout.jsx via useSocketConnection() —
  // that component wraps every staff tab and never unmounts on
  // navigation, so the connection stays alive for the whole session.
  // Having it here too meant every tab switch away from Dashboard called
  // socket.disconnect() on the shared singleton, killing the connection
  // the layout depended on. If this page needs to LISTEN for socket
  // events (not manage the connection), add a separate useEffect here
  // with only socket.on(...)/socket.off(...) — no connect()/disconnect().

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
            STAFF
          </span>
          <h1 className="font-serif font-semibold text-3xl sm:text-4xl">
            {user ? `Welcome, ${user.name}.` : "Welcome back."}
          </h1>
        </div>

    
      </div>

      {/* Dummy cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="border border-neutral-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-emerald-700" />
            <span className="font-mono text-xs tracking-wide text-neutral-500">
              NEXT SHIFT
            </span>
          </div>
          <p className="font-serif text-3xl font-semibold mt-2">Tomorrow</p>
          <p className="text-sm opacity-60 mt-1">9:00 AM – 5:00 PM</p>
        </div>

        <div className="border border-neutral-200 rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck size={16} className="text-emerald-700" />
            <span className="font-mono text-xs tracking-wide text-neutral-500">
              SHIFTS THIS WEEK
            </span>
          </div>
          <p className="font-serif text-3xl font-semibold mt-2">4</p>
          <p className="text-sm opacity-60 mt-1">2 completed · 2 upcoming</p>
        </div>
      </div>
    </div>
  );
}