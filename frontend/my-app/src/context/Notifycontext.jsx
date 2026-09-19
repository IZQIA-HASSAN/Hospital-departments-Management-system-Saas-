import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../utils/apiClient";

const NotificationContext = createContext(null);

const API_BASE = "http://localhost:5000/api/notifications";

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch notification history and poll every 15 seconds
    useEffect(() => {
        let cancelled = false;

        const fetchNotifications = async () => {
            try {
                const res = await apiFetch(`${API_BASE}?limit=30`);
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
            await apiFetch(`${API_BASE}/${id}/read`, { method: "PATCH" });
        } catch (err) {
            console.error("Failed to mark notification read:", err);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        try {
            await apiFetch(`${API_BASE}/read-all`, { method: "PATCH" });
        } catch (err) {
            console.error("Failed to mark all read:", err);
        }
    }, []);

    const deleteNotification = useCallback(async (id) => {
        const prevNotifications = notifications;
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        try {
            const res = await apiFetch(`${API_BASE}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Delete failed with status ${res.status}`);
        } catch (err) {
            console.error("Failed to delete notification:", err);
            setNotifications(prevNotifications); // roll back on failure
        }
    }, [notifications]);

    const clearReadNotifications = useCallback(async () => {
        const prevNotifications = notifications;
        setNotifications((prev) => prev.filter((n) => !n.read));
        try {
            const res = await apiFetch(`${API_BASE}?readOnly=true`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Clear read failed with status ${res.status}`);
        } catch (err) {
            console.error("Failed to clear read notifications:", err);
            setNotifications(prevNotifications); // roll back on failure
        }
    }, [notifications]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                markOneRead,
                markAllRead,
                deleteNotification,
                clearReadNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotifications must be used inside a <NotificationProvider>");
    return ctx;
}