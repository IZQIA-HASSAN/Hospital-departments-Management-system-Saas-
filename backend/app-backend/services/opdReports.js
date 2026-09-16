// pdf/reports/opd.reports.js

import PdfBuilder from "./pdfBuilder.js";
import OPDVisit from "../models/Opdvisit.js";// adjust path to match your actual project layout

function notFound(message) {
  const err = new Error(message);
  err.status = 404;
  return err;
}

// GET /api/reports/opd/visit-summary/:entityId  (entityId = OPDVisit.id, an integer)
async function visitSummary({ hospitalId, hospital, patientId }) {
  const visit = await OPDVisit.findOne({ where: { id: patientId, hospitalId } });
  if (!visit) throw notFound("OPD visit not found");

  const pdf = new PdfBuilder({
    hospital,
    title: "OPD Visit Summary",
    subtitle: `Patient: ${visit.patientName} · Token #${visit.tokenNumber}`,
  });

  pdf.section("Patient Details").keyValueGrid([
    ["Name", visit.patientName],
    ["Age", visit.age],
    ["Gender", visit.gender],
    ["Contact", visit.contact],
  ]);

  pdf.section("Visit Details").keyValueGrid([
    ["Department", visit.department],
    ["Doctor", visit.doctorName || "-"],
    ["Reason", visit.reason || "-"],
    ["Visit Date", visit.visitDate],
    ["Token Number", visit.tokenNumber],
    ["Status", visit.status],
  ]);

  return pdf;
}

// GET /api/reports/opd/daily-queue?date=YYYY-MM-DD  (no entityId — whole day for the hospital)
async function dailyQueue({ hospitalId, hospital, query }) {
  const visitDate = query?.date || new Date().toISOString().slice(0, 10);

  const visits = await OPDVisit.findAll({
    where: { hospitalId, visitDate },
    order: [["tokenNumber", "ASC"]],
  });

  const pdf = new PdfBuilder({
    hospital,
    title: "OPD Daily Queue",
    subtitle: `Date: ${visitDate}`,
  });

  pdf.table(
    ["Token", "Patient", "Department", "Doctor", "Status"],
    visits.map((v) => [v.tokenNumber, v.patientName, v.department, v.doctorName || "-", v.status])
  );

  return pdf;
}

export default {
  "visit-summary": visitSummary,
  "daily-queue": dailyQueue,
};