// src/components/reports/ReportDownloadButton.jsx
//
// Drop-in report button for any department page. `tone` matches each
// department's existing color: "rose" for ICU, "emerald" for OPD.
// `iconOnly` fits it into a crowded per-row action bar (next to
// Discharge/Complete/Delete); the default (labeled) suits a page header.
//
// Usage:
//   <ReportDownloadButton department="icu" reportType="admission-summary" entityId={bed.id} tone="rose" iconOnly label="Admission summary" />
//   <ReportDownloadButton department="icu" reportType="bed-status" tone="rose" mode="view" label="Bed status report" />
//   <ReportDownloadButton department="opd" reportType="daily-queue" tone="emerald" mode="view" query={{ date: todayStr }} label="Today's queue (PDF)" />

import { Download, Loader2, AlertCircle } from "lucide-react";
import { useReportDownload } from "../../hooks/useReportDownload";

const TONE_STYLES = {
  neutral: "border-neutral-200 text-neutral-600 hover:bg-neutral-50",
  rose: "border-rose-200 text-rose-700 hover:bg-rose-50",
  emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
  red: "border-red-200 text-red-700 hover:bg-red-50",
};

export default function ReportDownloadButton({
  department,
  reportType,
  entityId,
  query,
  label = "Download report",
  mode = "download", // "download" | "view" (opens in a new tab instead)
  tone = "neutral",
  iconOnly = false,
  className = "",
}) {
  const { run, status, error, isLoading } = useReportDownload();

  const handleClick = () => {
    if (mode === "view") {
      // Must happen synchronously in the click handler or browsers block it.
      const targetWindow = window.open("", "_blank");
      if (!targetWindow) {
        // Popup blocked entirely — fall back to a direct download instead.
        run(department, reportType, { entityId, query }, "download");
        return;
      }
      targetWindow.document.write("Generating report…");
      run(department, reportType, { entityId, query }, "view", targetWindow);
      return;
    }
    run(department, reportType, { entityId, query }, mode);
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        title={label}
        aria-label={label}
        className={`inline-flex items-center gap-1.5 rounded-lg border bg-white text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
          iconOnly ? "p-1.5" : "px-3 py-1.5"
        } ${TONE_STYLES[tone] || TONE_STYLES.neutral} ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {!iconOnly && (isLoading ? "Preparing..." : label)}
      </button>

      {status === "error" && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </span>
      )}
    </div>
  );
}