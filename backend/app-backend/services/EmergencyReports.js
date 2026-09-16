// pdf/reports/emergency.reports.js
//
// PLACEHOLDER: you haven't shared an Emergency model yet, so this can't be
// wired to real data. It's stubbed here only so the registry/routes work
// end-to-end and you can see the pattern. Once you share your Emergency
// model (or confirm it doesn't exist yet), replace the body of
// `triageReport` the same way icu.reports.js / opd.reports.js were done —
// swap in the real model + field names.

import PdfBuilder from "./pdfBuilder.js";

async function triageReport({ hospital }) {
  const pdf = new PdfBuilder({
    hospital,
    title: "Emergency Triage Report",
    subtitle: "Placeholder — no Emergency model wired up yet",
  });

  pdf.section("Not yet implemented").keyValueGrid([
    ["Status", "Share your Emergency model/fields to complete this report"],
  ]);

  return pdf;
}

export default {
  "triage-report": triageReport,
};