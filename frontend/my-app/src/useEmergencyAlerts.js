// src/hooks/useEmergencyAlerts.js
import { useState, useEffect, useCallback } from "react";

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

    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${API_BASE}/emergency/active`, { headers: authHeaders() });
        const data = await res.json();
        if (!cancelled) setAlerts(data);
      } catch (err) {
        console.error("Failed to load emergency alerts:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 15000);

    return () => { 
        cancelled = true; 
        clearInterval(intervalId);
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


  const createAlert = useCallback(async ({patientName , age , info})=>{
    const res = await fetch(`${API_BASE}/emergency` , {
      method : "POST",
     headers: authHeaders({ "Content-Type": "application/json" }),
      body : JSON.stringify({patientName , age , info}),
    })
    if(!res.ok){
      const body = await res.json().catch(()=>({}))
      throw new Error(body.message || "failed to send alert")
    }
    const {alert} = await res.json()
    setAlerts((prev)=>(prev.some((a)=>a.id === alert.id) ? prev : [alert , ...prev]))
    return alert;
  }, [])

  return { alerts, loading, resolveAlert  , createAlert};
}