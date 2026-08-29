// OPDVisitsChart.jsx
// Shows today's OPD visits broken down by status. Like ICUPatientsChart,
// it fetches its own data and takes no props — /api/opd is scoped to the
// logged-in user's own hospital, so the same component works unchanged
// on both the admin and staff dashboards.

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

const API_BASE = "http://localhost:5000/api/opd";

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

 export async function fetchTodaysVisits() {
  const today = new Date().toISOString().split("T")[0]; // matches visitDate's DATEONLY format
  const res = await fetch(`${API_BASE}?date=${today}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch OPD visits");
  const data = await res.json();
  return data.visits || [];
}

const STATUS_ORDER = ["waiting", "in-progress", "completed", "cancelled"];
const STATUS_LABELS = {
  waiting: "Waiting",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};
const STATUS_COLORS = {
  Waiting: "#d97706", // amber-600 — matches OPDcontent.jsx's status pill colors
  "In Progress": "#047857", // emerald-700
  Completed: "#a3a3a3", // neutral-400
  Cancelled: "#dc2626", // red-600
};

export default function OPDpatientschart() {
  const {
    data: visits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["opd", "visits", "today"],
    queryFn: fetchTodaysVisits,
    refetchInterval: 15000,
  });

  const data = STATUS_ORDER.map((status) => ({
    status: STATUS_LABELS[status],
    count: visits.filter((v) => v.status === status).length,
  }));

  const totalToday = visits.length;
  const noData = !isLoading && !isError && totalToday === 0;

  return (
    <div className="border border-neutral-200 rounded-xl p-6 bg-white">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs tracking-wide text-neutral-500">
          TODAY'S OPD VISITS BY STATUS
        </span>
        {!isLoading && !isError && (
          <span className="text-xs text-neutral-400">{totalToday} today</span>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <p className="text-sm text-neutral-400">Loading chart…</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Couldn't load OPD data.</p>
        ) : noData ? (
          <p className="text-sm text-neutral-400">No OPD visits registered today.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}