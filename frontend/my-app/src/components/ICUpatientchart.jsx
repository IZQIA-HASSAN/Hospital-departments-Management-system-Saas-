// ICUPatientsChart.jsx
// Shows how many currently-admitted ICU patients fall into each severity
// tier. Fetches its own data and needs no props — the backend already
// scopes /api/icu to the logged-in user's own hospital (see
// middleware/resolveHospital.js), so this same component works unchanged
// on both the admin dashboard and the staff dashboard.

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Same base URL + auth pattern already used in ICUcontent.jsx.
const API_BASE = "http://localhost:5000/api/icu";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchOccupiedBeds() {
  const res = await fetch(`${API_BASE}?status=occupied`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch ICU patients");
  return res.json();
}

const SEVERITY_ORDER = ["critical", "serious", "stable"];
const SEVERITY_COLORS = {
  Critical: "#dc2626", // red-600
  Serious: "#d97706", // amber-600
  Stable: "#047857", // emerald-700
};

export default function ICUpatientchart() {
  const {
    data: beds = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["icu", "beds", "occupied"],
    queryFn: fetchOccupiedBeds,
    refetchInterval: 15000, // matches ICUcontent.jsx's polling interval
  });

  // Reshape: array of beds -> array of { severity, count }
  const data = SEVERITY_ORDER.map((sev) => ({
    severity: sev[0].toUpperCase() + sev.slice(1),
    count: beds.filter((b) => b.severity === sev).length,
  }));

  const totalPatients = beds.length;
  const noData = !isLoading && (isError || totalPatients === 0);

  return (
    <div className="border border-neutral-200 rounded-xl p-6 bg-white">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-wide text-neutral-500">
          ICU PATIENTS BY SEVERITY
        </span>
        {!isLoading && !isError && (
          <span className="text-xs text-neutral-400">{totalPatients} total</span>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-neutral-400">Loading chart…</p>
        ) : noData ? (
          <p className="text-sm text-neutral-400">No patients currently in ICU.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="severity" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.severity} fill={SEVERITY_COLORS[entry.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}