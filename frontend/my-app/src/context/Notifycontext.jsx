import { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "../socket.js";                          // the shared instance
import { useSocketConnection } from "../useSocketConnection.js"; // handles connect/disconnect lifecycle

const NotificationContext = createContext(null);

const API_BASE = "http://localhost:5000/api/notifications";

function authHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // This hook owns connect-on-mount / disconnect-on-unmount for the socket.
    // Since NotificationProvider wraps your whole admin dashboard layout,
    // this effectively means: connect on dashboard load, disconnect on logout.
    useSocketConnection();

    // Fetch notification history once
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

    // Listen for live pushes. Separate effect from useSocketConnection —
    // that hook owns connect/disconnect, this one just owns this one listener.
    useEffect(() => {
        function handleNew(notification) {
            setNotifications((prev) => [notification, ...prev]);
        }
        socket.on("notification:new", handleNew);
        return () => socket.off("notification:new", handleNew);
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
        <NotificationContext.Provider value={{ notifications, unreadCount, loading, markOneRead, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used inside a <NotificationProvider>");
    return ctx;
}