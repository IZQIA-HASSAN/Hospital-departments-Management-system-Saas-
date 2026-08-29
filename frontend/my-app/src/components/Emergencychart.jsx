// EmergencyChart.jsx
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Siren } from "lucide-react";
import { useEmergencyAlerts } from "../useEmergencyAlerts";

// Buckets active alerts by the hour they came in, e.g. "14:00", "15:00"
function bucketByHour(alerts) {
  // FIX: alerts can be undefined (before the fetch settles) or a
  // non-array error body (e.g. {message: "..."} from a 403 when there's
  // no hospital yet) — iterating that directly threw "alerts is not
  // iterable". Bail out to an empty chart instead of crashing.
  if (!Array.isArray(alerts)) return [];

  const buckets = {};

  for (const alert of alerts) {
    const d = new Date(alert.createdAt);
    const label = `${String(d.getHours()).padStart(2, "0")}:00`;
    buckets[label] = (buckets[label] || 0) + 1;
  }

  return Object.entries(buckets)
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

export default function EmergencyChart() {
  const { alerts, loading } = useEmergencyAlerts();

  const chartData = useMemo(() => bucketByHour(alerts), [alerts]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 w-full">
      <div className="flex items-center gap-2 mb-1">
        <Siren className="h-4 w-4 text-red-600" />
        <span className="text-xs font-semibold text-red-700 tracking-wide">
          ACTIVE EMERGENCIES BY HOUR
        </span>
      </div>

      {loading && (
        <p className="text-sm text-neutral-400 py-6">Loading…</p>
      )}

      {!loading && chartData.length === 0 && (
        <p className="text-sm text-neutral-400 py-6">No active emergencies to chart.</p>
      )}

      {!loading && chartData.length > 0 && (
        <div className="h-48 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fecaca" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: "#7f1d1d" }}
                tickLine={false}
                axisLine={{ stroke: "#fecaca" }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#7f1d1d" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #fecaca", fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}