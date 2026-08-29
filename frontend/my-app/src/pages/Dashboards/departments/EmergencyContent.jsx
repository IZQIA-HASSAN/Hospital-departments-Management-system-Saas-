// EmergencyPage.jsx
import { useState } from "react";
import { Siren, Check, AlertTriangle, X, Plus } from "lucide-react";
import { useEmergencyAlerts } from "../../../useEmergencyAlerts";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function EmergencyContent() {
  const { alerts, loading, error, resolveAlert, createAlert } = useEmergencyAlerts();

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ patientName: "", age: "", info: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormError(null);
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
      setFormOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Siren className="h-5 w-5 text-red-600" />
          <h1 className="text-lg font-semibold text-neutral-800">Emergency Alerts</h1>
        </div>

        <button
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <Plus className="h-3.5 w-3.5" />
          New emergency
        </button>
      </div>

      {/* Active list — restyled to match the ICU/OPD chart card look */}
      <div className=" border-neutral-200 rounded-xl bg-white overflow-hidden border h-80">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-mono text-xs tracking-wide text-neutral-500">
            ACTIVE EMERGENCIES {!loading && `(${alerts.length})`}
          </h2>
        </div>

        <div className="overflow-y-auto h-[420px]">
          {loading ? (
            <p className="px-6 py-6 text-sm text-neutral-400">Loading...</p>
          ) : alerts.length === 0 ? (
            <p className="px-6 py-6 text-sm text-neutral-400">No active emergencies.</p>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {alerts.map((alert) => (
                <li key={alert.id} className="flex items-center justify-between px-6 py-4">
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

          {error && <p className="px-6 py-3 text-xs text-red-600">{error}</p>}
        </div>
      </div>

      {/* Modal popup with the registration form */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Register a new emergency"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={closeForm}
            aria-hidden="true"
          />

          <div className="relative z-10 w-full max-w-md overflow-y-auto rounded-xl border border-red-200 bg-red-50 p-4 shadow-xl max-h-[90vh]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-red-700">Register a new emergency</h2>
              <button
                onClick={closeForm}
                className="rounded-md p-1 text-neutral-500 hover:bg-red-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-3">
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
                    autoFocus
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
                  rows={3}
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

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <Siren className="h-3.5 w-3.5" />
                  {submitting ? "Sending..." : "Send emergency alert"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}