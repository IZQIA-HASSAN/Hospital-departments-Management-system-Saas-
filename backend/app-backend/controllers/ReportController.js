// controllers/reportController.js
//
// One controller for every department. It never contains department-specific
// logic — that all lives in pdf/reports/*.js. This is what lets you add a new
// department without touching routing or auth wiring.

import { getReportHandler , listReports , listDepartments } from "../utils/reportRegistry.js";
import Hospital from "../models/Hospital.js"; // adjust path if needed

export async function generateReport(req, res) {
  const { department, reportType } = req.params;
  const handler = getReportHandler(department, reportType);

  if (!handler) {
    return res.status(404).json({
      error: `Unknown report '${reportType}' for department '${department}'`,
    });
  }

  try {
    // req.hospitalId is set by resolveHospital — never trust req.body/req.params for this.
    // If resolveHospital only sets hospitalId (not the full Hospital row), fetch it here
    // so report letterheads have name/address/city/phone available.
    const hospital = req.hospital || (await Hospital.findByPk(req.hospitalId));
    if (!hospital) {
      return res.status(404).json({ error: "Hospital not found for this account" });
    }

    const pdf = await handler({
      hospitalId: req.hospitalId,
      hospital,
      patientId: req.params.entityId,
      user: req.user,
      query: req.query,
    });

    const filename = `${department}-${reportType}-${Date.now()}.pdf`;
    pdf.toStream(res, filename);
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Failed to generate report" });
  }
}

export function getAvailableReports(req, res) {
  const { department } = req.params;
  const reports = listReports(department);

  if (!reports.length) {
    return res.status(404).json({ error: `Unknown department '${department}'` });
  }

  return res.json({ department, reports });
}

export function getDepartments(req, res) {
  return res.json({ departments: listDepartments() });
}