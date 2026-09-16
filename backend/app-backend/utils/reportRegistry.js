// pdf/reportRegistry.js
//
// Single source of truth for "which departments can generate which reports".
// Adding a new department = add one import + one line here. The controller
// and routes never change.

import icuReports from "../services/icuReports.js";
import opdReports from "../services/opdReports.js";
import emergencyReports from "../services/EmergencyReports.js"

const registry = {
  icu: icuReports,
  opd: opdReports,
  emergency: emergencyReports,
  // pediatrics: pediatricsReports,  <- future dept example
};

export function getReportHandler(department, reportType) {
  const dept = registry[department];
  if (!dept) return null;
  return dept[reportType] || null;
}

export function listReports(department) {
  const dept = registry[department];
  return dept ? Object.keys(dept) : [];
}

export function listDepartments() {
  return Object.keys(registry);
}