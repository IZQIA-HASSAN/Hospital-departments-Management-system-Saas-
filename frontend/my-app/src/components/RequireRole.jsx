// src/components/RequireRole.jsx
import { Navigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    // Logged in, but wrong role for this section — send them to their own dashboard
    return <Navigate to={user.role === "admin" ? "/admin" : "/staffdash"} replace />;
  }

  return children;
}