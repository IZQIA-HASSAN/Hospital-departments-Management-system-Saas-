// RequireHospital.jsx
//
// Wraps the admin area so that NOTHING underneath it — ICU chart, OPD
// chart, Staff, Notifications, the emergency socket, etc. — ever mounts
// (and therefore never fires its fetch/socket-connect) until we've
// confirmed a hospital exists for this account.
//
// This is the single choke point: instead of adding `enabled: hasHospital`
// to every query in every page, every admin page just becomes a child of
// this component and gets the guard for free.

import { useHospital } from "../useHospital.js"; // adjust path to wherever useHospital.js lives

export default function RequireHospital({ children }) {
  const { data: hospital, isLoading, error } = useHospital();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-sm text-red-600">
          {error.message || "Failed to load hospital"}
        </p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="mx-auto max-w-2xl p-10 text-center">
        <p className="font-serif text-xl mb-1">No hospital yet</p>
        <p className="text-sm opacity-60">
          Create your hospital to unlock ICU, OPD, staff, and emergency features.
        </p>
        {/* e.g. <Link to="/admin/create-hospital">Create hospital</Link> */}
      </div>
    );
  }

  // Hospital confirmed — safe to mount everything below, all fetches
  // and the socket connection now happen exactly once, for real.
  return children;
}