import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import socket from "../../../socket.js";

export async function fetchStaff() {
  const res = await fetch("http://localhost:5000/api/staff", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load staff");
  return data;
}

// Sends an invite email instead of creating the staff record directly.
// The actual Staff row gets created when the invited person completes
// signup via the link in that email (POST /api/staff/staff-signup or
// whatever your invite-completion route is).
async function inviteStaff(payload) {
  const res = await fetch("http://localhost:5000/api/staff/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send invite");
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
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const {
    data: staffList = [],
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
  });

  const inviteMutation = useMutation({
    mutationFn: inviteStaff,
    onSuccess: () => {
      setInviteEmail("");
      setInviteSent(true);
      setTimeout(() => setInviteSent(false), 4000);
    },
  });

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

  const handleInvite = (e) => {
    e.preventDefault();
    inviteMutation.mutate({ email: inviteEmail });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Remove this staff member?")) return;
    deleteMutation.mutate(id);
  };

  const onlineCount = staffList.filter((s) => s.isOnline).length;

  return (
    <div>
      {/* Single invite form — only one email input on this page */}
      <div className="border border-neutral-200 rounded-xl p-6 bg-white mb-8">
        <p className="font-serif text-lg font-semibold mb-4">
          Invite a staff member
        </p>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="staff@example.com"
            className="flex-1 bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
          />
          <button
            type="submit"
            disabled={inviteMutation.isPending}
            className="inline-flex items-center justify-center gap-2 bg-emerald-700 text-neutral-50 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            <Mail size={16} />
            {inviteMutation.isPending ? "Sending…" : "Send Invite"}
          </button>
        </form>
        {inviteSent && (
          <p className="text-sm text-emerald-700 mt-3">Invite sent.</p>
        )}
        {inviteMutation.isError && (
          <p className="text-sm text-red-600 mt-3">
            {inviteMutation.error.message}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-serif text-lg font-semibold">Staff on roster</p>
          <p className="text-sm opacity-60 mt-0.5">
            {onlineCount} online · {staffList.length} total
          </p>
        </div>
      </div>

      {(queryError || deleteMutation.isError) && (
        <p className="text-sm text-red-600 mb-6">
          {queryError?.message || deleteMutation.error?.message}
        </p>
      )}

      {isLoading ? (
        <p className="text-sm opacity-60">Loading staff…</p>
      ) : staffList.length === 0 ? (
        <div className="border border-dashed border-neutral-300 rounded-xl p-10 text-center bg-white">
          <p className="font-serif text-xl mb-1">No staff yet</p>
          <p className="text-sm opacity-60">Invite your first staff member above.</p>
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