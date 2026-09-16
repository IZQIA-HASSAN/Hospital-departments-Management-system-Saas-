// pdf/reports/icu.reports.js
//
// IcuBed is a physical-bed row whose patient fields are a snapshot of the
// current occupant (per your model's comment) — there is no separate
// Patient or Vital table for ICU. So the per-bed report is an admission
// snapshot, not a vitals history.

import PdfBuilder from "./pdfBuilder.js";
import IcuBed from "../models/ICUvisit.js";// adjust path to match your actual project layout

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

// GET /api/reports/icu/admission-summary/:entityId  (entityId = IcuBed.id, a UUID)
async function admissionSummary({ hospitalId, hospital, patientId }) {
  const bed = await IcuBed.findOne({
    where: { id: patientId, hospitalId },
    include: [{ association: "assignedStaff", attributes: ["id", "name"] }],
  });
  if (!bed) throw notFound("ICU bed not found");
  if (bed.status !== "occupied") {
    throw notFound("This bed has no current admission to report on");
  }

  const pdf = new PdfBuilder({
    hospital,
    title: "ICU Admission Summary",
    subtitle: `Bed: ${bed.bedNumber}`,
  });

  pdf.section("Patient Details").keyValueGrid([
    ["Name", bed.patientName],
    ["Age", bed.age],
    ["Gender", bed.gender],
    ["Contact", bed.contact],
  ]);

  pdf.section("Clinical Details").keyValueGrid([
    ["Diagnosis", bed.diagnosis],
    ["Severity", bed.severity],
    ["Admitted At", bed.admittedAt],
    ["Assigned Staff", bed.assignedStaff?.name || "Unassigned"],
  ]);

  if (bed.dischargedAt) {
    pdf.section("Discharge Details").keyValueGrid([
      ["Discharged At", bed.dischargedAt],
      ["Disposition", bed.disposition],
    ]);
  }

  return pdf;
}

// GET /api/reports/icu/bed-status  (no entityId — whole hospital)
async function bedStatus({ hospitalId, hospital }) {
  const beds = await IcuBed.findAll({
    where: { hospitalId },
    order: [["bedNumber", "ASC"]],
  });

  const pdf = new PdfBuilder({ hospital, title: "ICU Bed Status Report" });

  pdf.table(
    ["Bed No.", "Status", "Patient", "Severity", "Admitted At"],
    beds.map((b) => [b.bedNumber, b.status, b.patientName || "-", b.severity || "-", b.admittedAt || "-"])
  );

  return pdf;
}

export default {
  "admission-summary": admissionSummary,
  "bed-status": bedStatus,
};