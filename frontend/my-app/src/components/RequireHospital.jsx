import { useHospital } from "../useHospital.js";

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

  // No more "no hospital" dead-end here — Admindash itself handles
  // the create-hospital flow. This component now only exists to hold
  // the loading/error states so children don't mount mid-fetch.
  return children;
}