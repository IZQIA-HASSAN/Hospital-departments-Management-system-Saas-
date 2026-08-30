import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BedDouble, HeartPulse, UserRound, Search, X } from "lucide-react";

// Router is mounted with app.use("/api/icu", icuRouter) and icuRouter's own
// routes now start at "/" (see routes/icu.js), so the base is just
// "/api/icu" — no more doubled "/icu/icu".
const API_BASE = "http://localhost:5000/api/icu";

const STATUS_STYLES = {
  occupied: "bg-rose-50 text-rose-700 border-rose-200",
  vacant: "bg-neutral-100 text-neutral-500 border-neutral-200",
  cleaning: "bg-amber-50 text-amber-700 border-amber-200",
};

const SEVERITY_STYLES = {
  critical: "bg-red-50 text-red-700 border-red-200",
  serious: "bg-amber-50 text-amber-700 border-amber-200",
  stable: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const EMPTY_FORM = {
  bedNumber: "",
  patientName: "",
  age: "",
  gender: "male",
  contact: "",
  diagnosis: "",
  severity: "stable",
};

// --- API functions ---------------------------------------------------------

// `protect` on the backend expects a Bearer token. Every request was 401ing
// because none of the fetch calls below attached one. Adjust the
// localStorage key ("token") here if your login flow stores it under a
// different name (e.g. "authToken", "accessToken").
function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function getallbeds({ status, severity } = {}) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (severity) params.set("severity", severity);

  const res = await fetch(`${API_BASE}?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Something went wrong fetching ICU beds");
  return res.json();
}

async function getbedbyid({ id }) {
  const res = await fetch(`${API_BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch bed");
  return res.json();
}

async function addpatient(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add patient");
  return data;
}

async function dischargepatient({ id, disposition }) {
  const res = await fetch(`${API_BASE}/${id}/discharge`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ disposition }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to discharge patient");
  }
  return res.json();
}

async function markbedready({ id }) {
  const res = await fetch(`${API_BASE}/${id}/ready`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to mark bed ready");
  }
  return res.json();
}

async function deletebed({ id }) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete bed");
  return true;
}

// --- Component ---------------------------------------------------------

const ICUcontent = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState("");
  const [debouncedsearch, setDebouncedsearch] = useState("");

  // REMOVED: a hospital-existence gate used to sit here, backed by
  // useHospital() (GET /api/hospitals/me). That endpoint is intentionally
  // admin-only on the backend (authorize("admin")) — it means "the
  // hospital I administer," not "the hospital I belong to." For a staff
  // account it 403s every single time, which made `hasHospital` always
  // false and permanently blocked staff from ever seeing ICU beds,
  // showing a "create your hospital" message they have no ability (or
  // need) to act on.
  //
  // It's also unnecessary: GET /api/icu is already scoped correctly for
  // BOTH admin and staff by the backend's attachHospitalId middleware
  // (see middleware/resolveHospital.js), which resolves the caller's
  // hospital from their own account (admin -> ownership lookup, staff ->
  // their stored hospitalId) and 403s with a real, specific message if
  // that's genuinely missing. No frontend pre-check needed.

  // No hospitalId here — the backend resolves it from the logged-in
  // user's token (see middleware/resolveHospital.js), so every user only
  // ever sees/edits their own hospital's beds.
  const bedsKey = ["icu", "beds"];

  const {
    data: beds = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: bedsKey,
    queryFn: () => getallbeds(),
    refetchInterval: 15000,
  });

  const addMutation = useMutation({
    mutationFn: addpatient,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: bedsKey });
    },
  });

  const dischargeMutation = useMutation({
    mutationFn: dischargepatient,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: bedsKey });
      const previous = queryClient.getQueryData(bedsKey);
      queryClient.setQueryData(bedsKey, (old = []) =>
        old.map((b) => (b.id === id ? { ...b, status: "cleaning" } : b))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(bedsKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: bedsKey }),
  });

  const readyMutation = useMutation({
    mutationFn: markbedready,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: bedsKey });
      const previous = queryClient.getQueryData(bedsKey);
      queryClient.setQueryData(bedsKey, (old = []) =>
        old.map((b) => (b.id === id ? { ...b, status: "vacant", patientName: null } : b))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(bedsKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: bedsKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletebed,
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: bedsKey });
      const previous = queryClient.getQueryData(bedsKey);
      queryClient.setQueryData(bedsKey, (old = []) => old.filter((b) => b.id !== id));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(bedsKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: bedsKey }),
  });

  const handleAdd = (e) => {
    e.preventDefault();
    addMutation.mutate({ ...form, age: Number(form.age) });
  };

  const occupied = beds.filter((b) => b.status === "occupied");
  const critical = occupied.filter((b) => b.severity === "critical").length;

  // debouncing here
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedsearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(
    () =>
      beds.filter((bed) =>
        (bed.patientName ?? "").toLowerCase().includes(debouncedsearch.toLowerCase())
      ),
    [beds, debouncedsearch]
  );

  const error =
    (isError && "Couldn't load ICU beds. Try refreshing.") ||
    addMutation.error?.message ||
    (dischargeMutation.isError && "Couldn't discharge patient.") ||
    (readyMutation.isError && "Couldn't mark bed ready.") ||
    (deleteMutation.isError && "Couldn't remove bed.") ||
    null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-end">
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-700 focus:ring-offset-2"
        >
          {showForm ? "Close" : "+ Add patient"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 text-left shadow-sm"
        >
          <h2 className="mb-4 text-sm font-semibold text-neutral-700">Admit to ICU</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Bed number" required>
              <input required value={form.bedNumber} onChange={(e) => setForm({ ...form, bedNumber: e.target.value })} className="icu-input" placeholder="ICU-01" />
            </Field>
            <Field label="Patient name" required>
              <input required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} className="icu-input" />
            </Field>
            <Field label="Age" required>
              <input required type="number" min="0" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="icu-input" />
            </Field>
            <Field label="Gender" required>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="icu-input">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Contact">
              <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="icu-input" />
            </Field>
            <Field label="Severity" required>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="icu-input">
                <option value="stable">Stable</option>
                <option value="serious">Serious</option>
                <option value="critical">Critical</option>
              </select>
            </Field>
            <Field label="Diagnosis" span2>
              <textarea rows={2} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} className="icu-input resize-none" />
            </Field>
          </div>
          <button type="submit" disabled={addMutation.isPending} className="mt-5 rounded-lg bg-rose-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-800 disabled:opacity-50">
            {addMutation.isPending ? "Admitting..." : "Admit patient"}
          </button>
          <style>{`
            .icu-input { width: 100%; border: 1px solid #E5E5E5; border-radius: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; outline: none; }
            .icu-input:focus { border-color: #BE123C; box-shadow: 0 0 0 2px rgba(190,18,60,0.15); }
          `}</style>
        </form>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white text-left shadow-sm h-[390px] overflow-y-scroll">
        <div className="border-b border-neutral-200 px-6 py-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-700">ICU beds</h2>
            <span className="text-xs text-neutral-400">
              {occupied.length} occupied{critical > 0 ? ` · ${critical} critical` : ""}
            </span>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-9 text-sm text-neutral-700 outline-none transition placeholder:text-neutral-400 focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-700/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="px-6 py-16 text-center text-sm text-neutral-400">Loading beds...</div>
        ) : beds.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-serif text-lg text-neutral-700">No ICU beds yet</p>
            <p className="mt-1 text-sm text-neutral-400">Admitted patients will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-neutral-500">No patients match "{search}"</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {filtered.map((bed) => (
              <li key={bed.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-700 text-sm font-bold text-white">
                    <BedDouble className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-800">
                      {bed.status === "occupied" ? (
                        <>
                          <UserRound className="h-3.5 w-3.5 text-neutral-400" />
                          {bed.patientName}
                          <span className="font-normal text-neutral-400">
                            · {bed.age}{bed.gender ? bed.gender[0].toUpperCase() : ""}
                          </span>
                        </>
                      ) : (
                        <span className="text-neutral-400">{bed.bedNumber}</span>
                      )}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-400">
                      <HeartPulse className="h-3 w-3" />
                      {bed.bedNumber}
                      {bed.diagnosis ? ` · ${bed.diagnosis}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {bed.status === "occupied" && bed.severity && (
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${SEVERITY_STYLES[bed.severity]}`}>
                      {bed.severity}
                    </span>
                  )}
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[bed.status]}`}>
                    {bed.status}
                  </span>
                  {bed.status === "occupied" && (
                    <button
                      onClick={() => dischargeMutation.mutate({ id: bed.id, disposition: "discharged" })}
                      className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                    >
                      Discharge
                    </button>
                  )}
                  {bed.status === "cleaning" && (
                    <button
                      onClick={() => readyMutation.mutate({ id: bed.id })}
                      className="rounded-lg bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-800"
                    >
                      Mark ready
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate({ id: bed.id })}
                    className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    Remove
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

export default ICUcontent