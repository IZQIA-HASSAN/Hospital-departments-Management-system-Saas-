
import { Siren, Check } from "lucide-react";
import { useEmergencyAlerts } from "../../src/useEmergencyAlerts";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function EmergencyPanel() {
  const { alerts, loading, resolveAlert } = useEmergencyAlerts();

  if (loading) return null; // avoid a flash of "no emergencies" while loading
  if (alerts.length === 0) return null; // hide entirely when nothing active — don't clutter the dashboard

  return (
    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-red-200 px-4 py-3">
        <Siren className="h-4 w-4 text-red-600" />
        <h2 className="text-sm font-semibold text-red-700">
          Active emergencies ({alerts.length})
        </h2>
      </div>

      <ul className="divide-y divide-red-100">
        {alerts.map((alert) => (
          <li key={alert.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {alert.patientName}
                {alert.age ? <span className="font-normal text-neutral-400"> · {alert.age}</span> : null}
              </p>
              {alert.info && <p className="mt-0.5 text-xs text-neutral-500">{alert.info}</p>}
              <p className="mt-0.5 text-xs text-neutral-400">{timeAgo(alert.createdAt)}</p>
            </div>

            <button
              onClick={() => resolveAlert(alert.id)}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
            >
              <Check className="h-3.5 w-3.5" />
              Resolve
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}