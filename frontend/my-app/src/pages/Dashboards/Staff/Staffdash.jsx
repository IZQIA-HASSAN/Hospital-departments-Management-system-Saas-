import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, BedDouble, Stethoscope, Siren } from "lucide-react";
import ICUpatientchart, { occupiedbeds } from "../../../components/ICUpatientchart";
import OPDpatientschart, { fetchTodaysVisits } from "../../../components/OPDpatientschart";
import EmergencyChart from "../../../components/Emergencychart";
import { useEmergencyAlerts } from "../../../useEmergencyAlerts";

export default function StaffDash() {
  const [showNotifications, setShowNotifications] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  const notifications = [];
  const hospitalName = user?.hospitalName || null;

  // Emergency count — existing hook, unchanged
  const { alerts: emergencyAlerts, loading: emergencyLoading } = useEmergencyAlerts();
  const emergencyCount = emergencyLoading ? null : emergencyAlerts.length;

  // ICU / OPD counts — SAME queryKey + queryFn as the chart components below,
  // so React Query dedupes this into one network call, not two. No extra
  // endpoint, no props into the charts — just shared cache.
  const { data: icuBeds = [], isLoading: icuLoading } = useQuery({
    queryKey: ["icu", "beds", "occupied"],
    queryFn: occupiedbeds,
    refetchInterval: 15000,
  });
  const icuCount = icuLoading ? null : icuBeds.length;

  const { data: opdVisits = [], isLoading: opdLoading } = useQuery({
    queryKey: ["opd", "visits", "today"],
    queryFn: fetchTodaysVisits,
    refetchInterval: 15000,
  });
  const opdCount = opdLoading ? null : opdVisits.length;

  // NOTE: socket connection management was removed from here entirely.
  // It now lives solely in StaffLayout.jsx via useSocketConnection() —
  // that component wraps every staff tab and never unmounts on
  // navigation, so the connection stays alive for the whole session.
  // Having it here too meant every tab switch away from Dashboard called
  // socket.disconnect() on the shared singleton, killing the connection
  // the layout depended on. If this page needs to LISTEN for socket
  // events (not manage the connection), add a separate useEffect here
  // with only socket.on(...)/socket.off(...) — no connect()/disconnect().

  return (
    <>
      <div>
        <div className="flex items-start justify-between mb-8">
          <div>
            <span className="block font-mono text-xs tracking-[0.14em] text-emerald-700 mb-2">
              STAFF
            </span>
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl">
              {user ? `Welcome, ${user.name}.` : "Welcome back."}
            </h1>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="border border-neutral-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={16} className="text-emerald-700" />
              <span className="font-mono text-xs tracking-wide text-neutral-500">
                HOSPITAL
              </span>
            </div>
            <p className="font-serif text-3xl font-semibold mt-2">
              {hospitalName || "—"}
            </p>
            <p className="text-sm opacity-60 mt-1">
              {hospitalName ? "You're invited to this hospital." : "No hospital on file."}
            </p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <BedDouble size={16} className="text-emerald-700" />
              <span className="font-mono text-xs tracking-wide text-neutral-500">
                ICU PATIENTS
              </span>
            </div>
            <p className="font-serif text-3xl font-semibold mt-2">
              {icuCount ?? "—"}
            </p>
            <p className="text-sm opacity-60 mt-1">Currently admitted</p>
          </div>

          <div className="border border-neutral-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Stethoscope size={16} className="text-emerald-700" />
              <span className="font-mono text-xs tracking-wide text-neutral-500">
                OPD PATIENTS
              </span>
            </div>
            <p className="font-serif text-3xl font-semibold mt-2">
              {opdCount ?? "—"}
            </p>
            <p className="text-sm opacity-60 mt-1">Seen today</p>
          </div>

          <div className="border border-red-200 rounded-xl p-6 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <Siren size={16} className="text-red-600" />
              <span className="font-mono text-xs tracking-wide text-red-700">
                EMERGENCY
              </span>
            </div>
            <p className="font-serif text-3xl font-semibold mt-2 text-red-700">
              {emergencyCount ?? "—"}
            </p>
            <p className="text-sm opacity-60 mt-1">Active alerts</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="w-full lg:w-[360px] shrink-0">
          <ICUpatientchart />
        </div>
        <div className="w-full lg:w-[360px] shrink-0">
          <OPDpatientschart />
        </div>
        <div className="w-full lg:w-[360px] shrink-0 mt-5">
          <EmergencyChart />
        </div>
      </div>
    </>
  );
}