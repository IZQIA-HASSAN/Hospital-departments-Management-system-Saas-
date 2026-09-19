// src/components/NotificationBell.jsx
import { useState, useEffect, useRef } from "react";
import { Bell, ShieldAlert, LogIn, LogOut, BedDouble, UserRound, X } from "lucide-react";
import { useNotifications } from "../context/Notifycontext";

const TYPE_ICONS = {
  staff_login: LogIn,
  staff_logout: LogOut,
  emergency: ShieldAlert,
  patient_critical: ShieldAlert,
  patient_admitted: UserRound,
  patient_discharged: UserRound,
  bed_ready: BedDouble,
};

const SEVERITY_DOT = {
  critical: "bg-red-600",
  warning: "bg-amber-500",
  info: "bg-neutral-400",
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markOneRead,
    markAllRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasRead = notifications.some((n) => n.read);

  return (
    <div className="relative " ref={panelRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-700 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-96 rounded-xl border border-neutral-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-neutral-700">Notifications</h3>
            <div className="flex items-center gap-3">
              {hasRead && (
                <button
                  onClick={clearReadNotifications}
                  className="text-xs font-medium text-neutral-500 hover:underline"
                >
                  Clear read
                </button>
              )}
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-medium text-rose-700 hover:underline">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <ul className="max-h-96 overflow-y-auto divide-y divide-neutral-100">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-neutral-400">No notifications</li>
            ) : (
              notifications.map((n) => {
                const Icon = TYPE_ICONS[n.type] || Bell;
                return (
                  <li
                    key={n.id}
                    onClick={() => !n.read && markOneRead(n.id)}
                    className={`group flex cursor-pointer items-start gap-3 px-4 py-3 text-sm hover:bg-neutral-50 ${
                      n.read ? "text-neutral-400" : "text-neutral-800"
                    }`}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="flex-1">
                      <p className={n.read ? "" : "font-medium"}>{n.message}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEVERITY_DOT[n.severity]}`} />}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="ml-1 shrink-0 rounded p-1 text-neutral-300 opacity-0 hover:bg-neutral-200 hover:text-neutral-600 group-hover:opacity-100"
                      aria-label="Delete notification"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}