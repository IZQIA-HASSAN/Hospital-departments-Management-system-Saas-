// src/api/reportsApi.js
//
// Talks to /api/reports/* on your Express backend. This is the only file
// that needs to change if your auth token storage or API base URL differs.

const API_BASE = "http://localhost:5000/api/reports";

// Cookie-based auth: the JWT rides in an httpOnly cookie set by your login
// endpoint, so no token handling needed here — just make sure cookies are
// sent with every request.
async function authorizedFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
  });
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function buildReportPath(department, reportType, entityId, query) {
  let path = `/${department}/${reportType}`;
  if (entityId) path += `/${entityId}`;
  if (query && Object.keys(query).length) {
    path += `?${new URLSearchParams(query).toString()}`;
  }
  return path;
}

function filenameFromResponse(res, fallback) {
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  return match ? match[1] : fallback;
}

// GET /api/reports  -> { departments: [...] }
export async function listDepartments() {
  const res = await authorizedFetch("/");
  if (!res.ok) throw new Error((await safeJson(res))?.error || "Failed to load departments");
  return res.json();
}

// GET /api/reports/:department  -> { department, reports: [...] }
export async function listReportTypes(department) {
  const res = await authorizedFetch(`/${department}`);
  if (!res.ok) throw new Error((await safeJson(res))?.error || "Failed to load report types");
  return res.json();
}

// Core fetch: returns the PDF as a Blob + a resolved filename. Callers decide
// whether to trigger a download or open it in a new tab.
export async function fetchReport(department, reportType, { entityId, query } = {}) {
  const path = buildReportPath(department, reportType, entityId, query);
  const res = await authorizedFetch(path);

  if (!res.ok) {
    const body = await safeJson(res);
    throw new Error(body?.error || `Failed to generate report (status ${res.status})`);
  }

  const blob = await res.blob();
  const filename = filenameFromResponse(res, `${department}-${reportType}.pdf`);
  return { blob, filename };
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function openBlobInNewTab(blob, targetWindow) {
  console.log("openBlobInNewTab called", { hasTargetWindow: !!targetWindow, closed: targetWindow?.closed });
  const url = URL.createObjectURL(blob);
  console.log("blob url created:", url);

  if (targetWindow && !targetWindow.closed) {
    console.log("setting targetWindow.location.href");
    targetWindow.location.href = url;
  } else {
    console.log("falling back to window.open");
    window.open(url, "_blank", "noopener,noreferrer");
  }

  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}