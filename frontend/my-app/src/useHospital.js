// useHospital.js
// Same endpoint/shape Admindash.jsx already uses for hospitalQuery.
// Any component can call this and share the cached result (React Query
// caches by queryKey — calling this from three different files still
// only hits the network once, not three times).

import { useQuery } from "@tanstack/react-query";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function fetchMyHospital() {
  const res = await fetch("http://localhost:5000/api/hospitals/me", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load hospital");
  return data.hospital; // null if the admin hasn't created one yet
}

export function useHospital() {
  return useQuery({
    queryKey: ["myhospital"],
    queryFn: fetchMyHospital,
  });
}