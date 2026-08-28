// EmergencyPage.jsx
import { useState } from "react";
import { Siren, Check, AlertTriangle } from "lucide-react";
import { useEmergencyAlerts } from "../../../useEmergencyAlerts";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function EmergencyContent() {
  const { alerts, loading, error, resolveAlert, createAlert } = useEmergencyAlerts();

  const [form, setForm] = useState({ patientName: "", age: "", info: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName.trim()) {
      setFormError("Patient name is required");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createAlert({
        patientName: form.patientName.trim(),
        age: form.age ? Number(form.age) : null,
        info: form.info.trim() || null,
      });
      setForm({ patientName: "", age: "", info: "" });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-2">
        <Siren className="h-5 w-5 text-red-600" />
        <h1 className="text-lg font-semibold text-neutral-800">Emergency Alerts</h1>
      </div>

      {/* Registration form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <h2 className="mb-3 text-sm font-semibold text-red-700">Register a new emergency</h2>

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">
              Patient name *
            </label>
            <input
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">Age</label>
            <input
              name="age"
              type="number"
              min="0"
              value={form.age}
              onChange={handleChange}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              placeholder="42"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Details</label>
          <textarea
            name="info"
            value={form.info}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Chest pain, difficulty breathing..."
          />
        </div>

        {formError && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="h-3.5 w-3.5" />
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          <Siren className="h-3.5 w-3.5" />
          {submitting ? "Sending..." : "Send emergency alert"}
        </button>
      </form>

      {/* Active list */}
      <div className="rounded-xl border border-neutral-200 overflow-hidden">
        <div className="border-b border-neutral-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-700">
            Active emergencies {!loading && `(${alerts.length})`}
          </h2>
        </div>

        {loading ? (
          <p className="px-4 py-6 text-sm text-neutral-400">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-neutral-400">No active emergencies.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {alerts.map((alert) => (
              <li key={alert.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-neutral-800">
                    {alert.patientName}
                    {alert.age ? (
                      <span className="font-normal text-neutral-400"> · {alert.age}</span>
                    ) : null}
                  </p>
                  {alert.info && (
                    <p className="mt-0.5 text-xs text-neutral-500">{alert.info}</p>
                  )}
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
        )}

        {error && <p className="px-4 py-3 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}