// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getSocket } from "../lib/socket";

const NotificationContext = createContext(null);

const API_BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/notifications`;

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch history once, when the provider mounts (i.e. once per dashboard session)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}?limit=30`, { headers: authHeaders() });
        const data = await res.json();
        if (!cancelled) setNotifications(data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // One socket connection for the whole dashboard, not one per section
  useEffect(() => {
    const socket = getSocket();
    socket.connect();

    function handleNew(notification) {
      setNotifications((prev) => [notification, ...prev]);
    }

    socket.on("notification:new", handleNew);
    socket.on("connect_error", (err) => console.error("Socket connect error:", err.message));

    return () => {
      socket.off("notification:new", handleNew);
      // Don't disconnect here — provider unmounting on route change
      // shouldn't kill the connection; only logout should (see socket.js)
    };
  }, []);

  const markOneRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await fetch(`${API_BASE}/${id}/read`, { method: "PATCH", headers: authHeaders() });
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE}/read-all`, { method: "PATCH", headers: authHeaders() });
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markOneRead, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside a <NotificationProvider>");
  }
  return ctx;
}