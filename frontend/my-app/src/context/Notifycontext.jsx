import { createContext, useContext, useState, useEffect, useCallback } from "react";

const NotificationContext = createContext(null);



const API_BASE = "http://localhost:5000/api/notifications";

function authHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch notification history and poll every 15 seconds
    useEffect(() => {
        let cancelled = false;

        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${API_BASE}?limit=30`, { headers: authHeaders() });
                if (!res.ok) {
                    if (!cancelled) setNotifications([]);
                    return;
                }
                const data = await res.json();
                if (!cancelled) setNotifications(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load notifications:", err);
                if (!cancelled) setNotifications([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);

        return () => { 
            cancelled = true; 
            clearInterval(intervalId);
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