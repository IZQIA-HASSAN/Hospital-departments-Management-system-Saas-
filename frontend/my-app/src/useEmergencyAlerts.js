// src/hooks/useEmergencyAlerts.js
import { useState, useEffect, useCallback } from "react";
import socket from "./socket";

const API_BASE = "http://localhost:5000/api/notifications";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export function useEmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/emergency/active`, { headers: authHeaders() });
        const data = await res.json();
        if (!cancelled) setAlerts(data);
      } catch (err) {
        console.error("Failed to load emergency alerts:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    function handleNew(alert) {
      setAlerts((prev) => [alert, ...prev]);
    }
    function handleResolved({ id }) {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }
    socket.on("emergency:new", handleNew);
    socket.on("emergency:resolved", handleResolved);
    return () => {
      socket.off("emergency:new", handleNew);
      socket.off("emergency:resolved", handleResolved);
    };
  }, []);

  const resolveAlert = useCallback(async (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id)); // optimistic
    try {
      await fetch(`${API_BASE}/emergency/${id}/resolve`, {
        method: "PATCH",
        headers: authHeaders(),
      });
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
  }, []);

  return { alerts, loading, resolveAlert };
}