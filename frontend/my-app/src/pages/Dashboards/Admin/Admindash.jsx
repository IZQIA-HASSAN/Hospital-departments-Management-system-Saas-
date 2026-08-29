import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { fetchStaff } from "./Staff";

export default function Admindash() {
  const queryClient = useQueryClient();

  const [showhospitalform, setShowHospitalForm] = useState(false);

  const [hospitalform, setHospitalForm] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
  });

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const hospitalQuery = useQuery({
    queryKey: ["myhospital"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/hospitals/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load hospital");
      return data.hospital;
    },
  });

  const onChange = (e) => {
    setHospitalForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createhospital = useMutation({
    mutationFn: async (formData) => {
      const res = await fetch("http://localhost:5000/api/hospitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create hospital");
      return data.hospital;
    },
    onSuccess: () => {
      setShowHospitalForm(false);
      queryClient.invalidateQueries({ queryKey: ["myhospital"] });
    },
  });

  const onHospitalSubmit = (e) => {
    e.preventDefault();
    createhospital.mutate(hospitalform);
  };

  

const { data: staffList = [] ,isLoading :staffLoading } = useQuery({
  queryKey: ["staff"], // same key as in Staff.jsx — shares cache
  queryFn: fetchStaff,
});

const onlineCount = staffList.filter((s) => s.isOnline).length;


  return (
    <>
      <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
        DASHBOARD
      </span>
      <h1 className="font-serif font-semibold text-3xl sm:text-4xl mb-8">
        {user ? `Welcome, ${user.name}.` : "Welcome back."}
      </h1>

      {hospitalQuery.isLoading && (
        <p className="text-sm opacity-60 mb-6">Checking hospital setup…</p>
      )}

      {hospitalQuery.isError && (
        <p className="text-sm text-red-600 mb-6">{hospitalQuery.error.message}</p>
      )}

      {hospitalQuery.data === null && !showhospitalform && (
        <div className="border border-dashed border-emerald-300 bg-emerald-50 rounded-xl p-8 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Building2 className="text-emerald-700 mt-0.5" size={22} />
            <div>
              <p className="font-serif text-lg font-semibold">No hospital set up yet</p>
              <p className="text-sm opacity-60">
                Create your hospital to start adding staff and shifts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHospitalForm(true)}
            className="bg-emerald-700 text-neutral-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors whitespace-nowrap"
          >
            Create Hospital
          </button>
        </div>
      )}

      {hospitalQuery.data === null && showhospitalform && (
        <form
          onSubmit={onHospitalSubmit}
          className="border border-neutral-200 rounded-xl p-6 bg-white mb-8 flex flex-col gap-5"
        >
          <p className="font-serif text-lg font-semibold">Create your hospital</p>

          {createhospital.isError && (
            <p className="text-sm text-red-600">{createhospital.error.message}</p>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-mono text-xs tracking-wide text-neutral-500">
              HOSPITAL NAME
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={hospitalform.name}
              onChange={onChange}
              placeholder="St. Mary's General"
              className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="address" className="font-mono text-xs tracking-wide text-neutral-500">
                ADDRESS
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={hospitalform.address}
                onChange={onChange}
                placeholder="221B Baker Street"
                className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="city" className="font-mono text-xs tracking-wide text-neutral-500">
                CITY
              </label>
              <input
                id="city"
                name="city"
                type="text"
                required
                value={hospitalform.city}
                onChange={onChange}
                placeholder="Rawalpindi"
                className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="font-mono text-xs tracking-wide text-neutral-500">
              PHONE (OPTIONAL)
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={hospitalform.phone}
              onChange={onChange}
              placeholder="051 1234567"
              className="bg-transparent border-b border-neutral-300 py-2 text-[0.95rem] outline-none placeholder:text-neutral-400 focus:border-emerald-700 transition-colors"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={createhospital.isPending}
              className="bg-emerald-700 text-neutral-50 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors disabled:opacity-60"
            >
              {createhospital.isPending ? "Creating…" : "Create Hospital"}
            </button>
            <button
              type="button"
              onClick={() => setShowHospitalForm(false)}
              className="px-6 py-2.5 rounded-full text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {hospitalQuery.data && (
          <div className="border border-neutral-200 rounded-xl p-6 bg-white flex items-start gap-3">
            <Building2 className="text-emerald-700 mt-0.5 shrink-0" size={22} />
            <div className="min-w-0">
              <p className="font-serif text-lg font-semibold truncate">{hospitalQuery.data.name}</p>
              <p className="text-sm opacity-60 truncate">
                {hospitalQuery.data.address}, {hospitalQuery.data.city}
              </p>
              {hospitalQuery.data.phone && (
                <p className="text-sm opacity-60 truncate">{hospitalQuery.data.phone}</p>
              )}
            </div>
          </div>
        )}

        <div className="border border-neutral-200 rounded-xl p-6 bg-white">
          <span className="font-mono text-xs tracking-wide text-neutral-500">
            STAFF ON ROSTER
          </span>
          <p className="font-serif text-3xl font-semibold mt-2">{onlineCount}</p>
          <p className="text-sm opacity-60 mt-1">No staff added yet.</p>
        </div>

        <div className="border border-neutral-200 rounded-xl p-6 bg-white">
          <span className="font-mono text-xs tracking-wide text-neutral-500">
            SHIFTS TODAY
          </span>
          <p className="font-serif text-3xl font-semibold mt-2">—</p>
          <p className="text-sm opacity-60 mt-1">Nothing scheduled yet.</p>
        </div>
      </div>
    </>
  );
}