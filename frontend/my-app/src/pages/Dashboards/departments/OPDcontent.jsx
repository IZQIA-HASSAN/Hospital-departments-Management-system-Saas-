import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User2, Clock } from "lucide-react";

const API_BASE = "http://localhost:5000/api/opd";

const STATUS_STYLES = {
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  "in-progress": "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-neutral-100 text-neutral-500 border-neutral-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const EMPTY_FORM = {
  patientName: "",
  age: "",
  gender: "male",
  contact: "",
  department: "General",
  doctorName: "",
  reason: "",
};

// --- API functions -------------------------------------------------------

// OPD routes previously had no auth. They now require it, same as ICU —
// every call below needs a Bearer token or it 401s.
function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// GET requests can't carry a body — filters go in the query string instead
async function getallvisits({ date, status, department } = {}) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (status) params.set("status", status);
  if (department) params.set("department", department);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Something went wrong fetching visits");
  const data = await res.json();
  return data.visits || [];
}

async function registervisit(payload) {
  const res = await fetch(`${API_BASE}/register-visit`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
  return data;
}

async function updateopdvisit({ id, status }) {
  const res = await fetch(`${API_BASE}/update-visit-status/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || "Failed to update status");
  }
  return res.json();
}

async function deletevisit({ id }) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || data.error || "Failed to delete visit");
  }
  return res.json();
}

async function getvisitbyID({ id }) {
  const res = await fetch(`${API_BASE}/getopd-vist/${id}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch visit");
  const data = await res.json();
  return data.visit;
}

// --- Component -------------------------------------------------------------

const OPDcontent = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const visitsKey = ["opd", "visits"];

  const {
    data: visits = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: visitsKey,
    queryFn: () => getallvisits(),
    refetchInterval: 15000,
  });

  const registerMutation = useMutation({
    mutationFn: registervisit,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: visitsKey });
    },
  });

  const statusMutation = useMutation({
    mutationFn: updateopdvisit,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: visitsKey });
      const previous = queryClient.getQueryData(visitsKey);
      queryClient.setQueryData(visitsKey, (old = []) =>
        old.map((v) => (v.id === id ? { ...v, status } : v))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(visitsKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: visitsKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletevisit,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: visitsKey });
      const previous = queryClient.getQueryData(visitsKey);
      queryClient.setQueryData(visitsKey, (old = []) => old.filter((v) => v.id !== id));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(visitsKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: visitsKey }),
  });

  const handleRegister = (e) => {
    e.preventDefault();
    registerMutation.mutate({ ...form, age: Number(form.age) });
  };

  // only show today's waiting/in-progress patients in the "queue" view
  const todayStr = new Date().toISOString().split("T")[0];
  const queue = visits.filter(
    (v) =>
      v.visitDate === todayStr &&
      (v.status === "waiting" || v.status === "in-progress")
  );

  const error =
    (isError && "Couldn't load OPD visits. Try refreshing.") ||
    registerMutation.error?.message ||
    (statusMutation.isError && "Couldn't update status.") ||
    (deleteMutation.isError && "Couldn't delete visit.") ||
    null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
        >
          {showForm ? "Close" : "+ Register visit"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleRegister}
          className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 text-left shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-neutral-700">New OPD visit</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Patient name" required>
              <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="opd-input" />
            </Field>
            <Field label="Age" required>
              <input required type="number" min="0" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="opd-input" />
            </Field>
            <Field label="Gender" required>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="opd-input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Contact" required>
              <input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="opd-input" />
            </Field>
            <Field label="Department" required>
              <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="opd-input" />
            </Field>
            <Field label="Doctor">
              <input value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} className="opd-input" />
            </Field>
            <Field label="Reason for visit" span2>
              <textarea rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="opd-input resize-none" />
            </Field>
          </div>
          <button type="submit" disabled={registerMutation.isPending} className="mt-5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50">
            {registerMutation.isPending ? "Registering..." : "Register & assign token"}
          </button>
          <style>{`
            .opd-input { width: 100%; border: 1px solid #E5E5E5; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
            .opd-input:focus { border-color: #047857; box-shadow: 0 0 0 2px rgba(4,120,87,0.15); }
          `}</style>
        </form>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-neutral-700">Today's queue</h2>
          <span className="text-xs text-neutral-400">
            {queue.length} {queue.length === 1 ? "patient" : "patients"} waiting
          </span>
        </div>

        {isLoading ? (
          <div className="px-6 py-16 text-center text-sm text-neutral-400">Loading queue...</div>
        ) : queue.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-lg text-neutral-700">No patients in queue</p>
            <p className="mt-1 text-sm text-neutral-400">Registered visits will appear here as tokens are assigned.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {queue.map((visit) => (
              <li key={visit.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                    {visit.tokenNumber}
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-800">
                      <User2 className="h-3.5 w-3.5 text-neutral-400" />
                      {visit.patientName}
                      <span className="font-normal text-neutral-400">
                        · {visit.age}{visit.gender[0].toUpperCase()}
                      </span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                      <Clock className="h-3 w-3" />
                      {visit.department}
                      {visit.doctorName ? ` · Dr. ${visit.doctorName}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[visit.status]}`}>
                    {visit.status}
                  </span>
                  {visit.status === "waiting" && (
                    <button
                      onClick={() => statusMutation.mutate({ id: visit.id, status: "in-progress" })}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Start
                    </button>
                  )}
                  {visit.status === "in-progress" && (
                    <button
                      onClick={() => statusMutation.mutate({ id: visit.id, status: "completed" })}
                      className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate({ id: visit.id })}
                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

function Field({ label, required, span2, children }) {
  return (
    <label className={`block ${span2 ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

export default OPDcontent;