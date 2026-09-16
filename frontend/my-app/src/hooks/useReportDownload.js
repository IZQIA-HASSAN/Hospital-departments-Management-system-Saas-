// src/hooks/useReportDownload.js

import { useCallback, useState } from "react";
import { fetchReport, downloadBlob, openBlobInNewTab } from "../api/reportsApi";

export function useReportDownload() {
  const [status, setStatus] = useState("idle"); // "idle" | "loading" | "error"
  const [error, setError] = useState(null);

  const run = useCallback(async (department, reportType, options = {}, mode = "download", targetWindow) => {
    setStatus("loading");
    setError(null);
    try {
      const { blob, filename } = await fetchReport(department, reportType, options);
      if (mode === "view") {
        openBlobInNewTab(blob, targetWindow);
      } else {
        downloadBlob(blob, filename);
      }
      setStatus("idle");
    } catch (err) {
      if (targetWindow && !targetWindow.closed) targetWindow.close(); // don't leave a stuck blank tab behind
      setError(err.message || "Something went wrong generating the report");
      setStatus("error");
    }

    // in useReportDownload.js, inside run()
console.log("run() called, mode:", mode, "targetWindow:", targetWindow, "closed?", targetWindow?.closed);
const { blob, filename } = await fetchReport(department, reportType, options);
console.log("fetch succeeded, blob:", blob.size, filename);
if (mode === "view") {
  console.log("calling openBlobInNewTab, targetWindow still open?", targetWindow && !targetWindow.closed);
  openBlobInNewTab(blob, targetWindow);
}
  }, []);

  return { run, status, error, isLoading: status === "loading" };
}