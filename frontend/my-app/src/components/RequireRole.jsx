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

  // NOTE: the backend's JWT payload and its `authorize` middleware use
  // `accountType` (see middleware/checkRole.js — `role` there is a job
  // title, not an account-kind signal). But the frontend's login flow
  // saves the user object to localStorage with a `role` field holding
  // the account-kind value instead — confirmed from actual localStorage
  // contents: {"role":"admin", ...}, no `accountType` key exists there.
  // Checking `user.accountType` (as a previous version of this file did)
  // was always undefined, which is why every account got redirected to
  // "/staff" regardless of actual role.
  //
  // Longer term, the frontend and backend should agree on one field name
  // (ideally: save `accountType` from login too, matching the backend).
  // For now, this checks what's ACTUALLY in localStorage.
  if (user.role !== role) {
    // Logged in, but wrong role for this section — send them to their own dashboard
    return <Navigate to={user.role === "admin" ? "/admin" : "/staff"} replace />;
  }

  return children;
}