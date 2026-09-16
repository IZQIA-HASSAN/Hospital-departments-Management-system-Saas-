// src/components/reports/ReportsMenu.jsx
//
// One dropdown for hospital-wide reports (no specific bed/visit needed).
// Per-entity reports (one bed, one visit) stay as row-level buttons on
// their own pages — this menu only lists reports scoped to the whole
// hospital, so adding a department here is just adding one array entry.

import { useEffect, useRef, useState } from "react";
import { FileDown, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { useReportDownload } from "../../hooks/useReportDownload";

const REPORTS = [
  { department: "icu", reportType: "bed-status", label: "ICU — Bed status", tone: "rose" },
  { department: "opd", reportType: "daily-queue", label: "OPD — Today's queue", tone: "emerald" },
  // Add once emergency.reports.js is wired to a real model:
  // { department: "emergency", reportType: "daily-summary", label: "Emergency — Daily summary", tone: "red" },
];

const TONE_DOT = {
  rose: "bg-rose-600",
  emerald: "bg-emerald-600",
  red: "bg-red-600",
  neutral: "bg-neutral-500",
};

export default function ReportsMenu() {
  const [open, setOpen] = useState(false);
  const [activeLabel, setActiveLabel] = useState(null);
  const menuRef = useRef(null);
  const { run, status, error, isLoading } = useReportDownload();

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSelect = (report) => {
    setActiveLabel(report.label);
    setOpen(false);

    // Must happen synchronously in the click handler or browsers block it.
    const targetWindow = window.open("", "_blank");
    if (!targetWindow) {
      run(report.department, report.reportType, {}, "download");
      return;
    }
    targetWindow.document.write("Generating report…");
    run(report.department, report.reportType, {}, "view", targetWindow);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
      >
        <FileDown className="h-4 w-4" />
        Reports
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg">
          {REPORTS.map((report) => {
            const isActive = isLoading && activeLabel === report.label;
            return (
              <button
                key={`${report.department}-${report.reportType}`}
                onClick={() => handleSelect(report)}
                disabled={isLoading}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[report.tone] || TONE_DOT.neutral}`} />
                <span className="flex-1">{isActive ? "Preparing..." : report.label}</span>
                {isActive && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              </button>
            );
          })}
        </div>
      )}

      {status === "error" && (
        <div className="absolute right-0 mt-2 w-64 flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}