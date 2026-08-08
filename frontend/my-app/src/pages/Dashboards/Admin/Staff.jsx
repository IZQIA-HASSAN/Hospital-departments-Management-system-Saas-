import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus2 } from "lucide-react";
import socket from "../../../socket.js";

async function fetchStaff() {
  const res = await fetch("http://localhost:5000/api/staff", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load staff");
  return data;
}

async function createStaff(payload) {
  const res = await fetch("http://localhost:5000/api/staff", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to add staff");
  return data;
}

async function removeStaff(id) {
  const res = await fetch(`http://localhost:5000/api/staff/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to delete staff");
  }
  return id;
}

export default function Staff() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "staff" });

  // FIX: was queryFn: fetchStaff pointing at an undefined `fetchStaff` while
  // the function declared above was named `fetchstaff` (lowercase). Renamed
  // the function to fetchStaff so this actually resolves.
  const {
    data: staffList = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
  });

  // FIX: was `addmutation` (lowercase) but referenced later as `addMutation`.
  // Renamed consistently to addMutation everywhere below.
  const addMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: (newStaff) => {
      queryClient.setQueryData(["staff"], (old = []) =>
        old.find((s) => s.id === newStaff.id) ? old : [...old, newStaff]
      );
      setForm({ name: "", email: "", role: "staff" });
      setShowAddForm(false);
    },
  });

  // FIX: was `deletemutation` (lowercase) but referenced later as
  // `deleteMutation`. Renamed consistently.
  const deleteMutation = useMutation({
    mutationFn: removeStaff,
    onSuccess: (id) => {
      queryClient.setQueryData(["staff"], (old = []) =>
        old.filter((s) => s.id !== id)
      );
    },
  });

  useEffect(() => {
    socket.connect();

    // FIX: handler was named onStatuChanged (typo) but socket.on(...) below
    // referenced onStatusChanged, which didn't exist — this would have
    // thrown a ReferenceError. Renamed consistently.
    const onStatusChanged = ({ id, isOnline }) => {
      queryClient.setQueryData(["staff"], (old = []) =>
        old.map((s) => (s.id === id ? { ...s, isOnline } : s))
      );
    };

    const onAdded = (newStaff) => {
      queryClient.setQueryData(["staff"], (old = []) =>
        old.find((s) => s.id === newStaff.id) ? old : [...old, newStaff]
      );
    };

    const onDeleted = (id) => {
      queryClient.setQueryData(["staff"], (old = []) =>
        old.filter((s) => s.id !== id)
      );
    };

    socket.on("staff:statusChanged", onStatusChanged);
    socket.on("staff:added", onAdded);
    socket.on("staff:deleted", onDeleted);

    return () => {
      socket.off("staff:statusChanged", onStatusChanged);
      socket.off("staff:added", onAdded);
      socket.off("staff:deleted", onDeleted);
      socket.disconnect();
    };
  }, [queryClient]);

  const handleAddStaff = (e) => {
    e.preventDefault();
    addMutation.mutate(form);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    deleteMutation.mutate(id);
  };

  const onlineCount = staffList.filter((s) => s.isOnline).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-serif text-lg font-semibold">Staff on roster</p>
          <p className="text-sm opacity-60 mt-0.5">
            {onlineCount} online · {staffList.length} total
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="inline-flex items-center gap-2 bg-emerald-700 text-neutral-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
        >
          <UserPlus2 size={16} />
          Add Staff
        </button>
      </div>

      {(queryError || addMutation.isError || deleteMutation.isError) && (
        <p className="text-sm text-red-600 mb-6">
          {queryError?.message ||
            addMutation.error?.message ||
            deleteMutation.error?.message}
        </p>
      )}

      {showAddForm && (
        <form
          onSubmit={handleAddStaff}
          className="border border-neutral-200 rounded-xl p-6 bg-white mb-8 flex flex-col gap-5"
        >
          <p className="font-serif text-lg font-semibold">Add a staff member</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="staff-name"
                className="font-mono text-xs tracking-wide text-neutral-500"
              >
                FULL NAME
              </label>
              <input
                id="staff-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Amelia Rhodes"
                className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="staff-email"
                className="font-mono text-xs tracking-wide text-neutral-500"
              >
                EMAIL
              </label>
              <input
                id="staff-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="amelia@round.com"
                className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:w-48">
            <label
              htmlFor="staff-role"
              className="font-mono text-xs tracking-wide text-neutral-500"
            >
              ROLE
            </label>
            <select
              id="staff-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none focus:border-emerald-700 transition-colors"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={addMutation.isPending}
              className="bg-emerald-700 text-neutral-50 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {addMutation.isPending ? "Adding…" : "Add Staff"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-sm opacity-60">Loading staff…</p>
      ) : staffList.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
          <p className="font-serif text-xl mb-1">No staff yet</p>
          <p className="text-sm opacity-60">Add your first staff member above.</p>
        </div>
      ) : (
        <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left font-mono text-xs tracking-wide text-neutral-500">
              <tr>
                <th className="px-4 py-3">STATUS</th>
                <th className="px-4 py-3">NAME</th>
                <th className="px-4 py-3">EMAIL</th>
                <th className="px-4 py-3">ROLE</th>
                <th className="px-4 py-3">LAST SEEN</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {staffList.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          s.isOnline ? "bg-emerald-500" : "bg-neutral-300"
                        }`}
                      />
                      <span className={s.isOnline ? "text-emerald-700" : "text-neutral-500"}>
                        {s.isOnline ? "Online" : "Offline"}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{s.name}</td>
                  <td className="px-4 py-3 opacity-70">{s.email}</td>
                  <td className="px-4 py-3 opacity-70 capitalize">{s.role}</td>
                  <td className="px-4 py-3 opacity-60">
                    {new Date(s.lastSeen).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={deleteMutation.isPending}
                      className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}