import { useEffect } from "react";
import { apiFetch } from "../utils/apiClient";

const HEARTBEAT_INTERVAL_MS = 20 * 1000;

export function useHeartbeat() {
  useEffect(() => {
    const ping = () => {
      apiFetch("http://localhost:5000/api/staff/heartbeat", { method: "POST" }).catch(() => {});
    };
    ping(); // immediately on mount
    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}