import React, { useState } from "react";
import { Bell, Clock, CalendarCheck } from "lucide-react";

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

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2.5 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-neutral-700" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-emerald-700 text-[10px] font-medium text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 border border-neutral-200 rounded-xl bg-white shadow-lg overflow-hidden z-10">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="font-serif text-sm font-semibold">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm opacity-60 px-4 py-6 text-center">
                  No notifications yet.
                </p>
              ) : (
                <ul className="divide-y divide-neutral-100">
                  {notifications.map((n, i) => (
                    <li key={i} className="px-4 py-3 text-sm">
                      {n.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
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