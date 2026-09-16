// pdf/pdfBuilder.js
//
// Shared PDF rendering engine. Every department's report is built with this
// class so hospital branding, layout, and page numbering stay consistent
// without every report file re-implementing them.
//
// npm install pdfkit

import PDFDocument from "pdfkit";

class PdfBuilder {
  constructor({ hospital, title, subtitle } = {}) {
    this.doc = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });
    this.hospital = hospital || {};
    this.title = title || "Report";
    this.subtitle = subtitle;
    this._drawLetterhead();
  }

  _drawLetterhead() {
    const { doc, hospital, title, subtitle } = this;

    doc.fontSize(16).fillColor("#111827").text(hospital.name || "Hospital");

    const addressLine = [hospital.address, hospital.city].filter(Boolean).join(", ");
    if (addressLine) {
      doc.fontSize(9).fillColor("#6b7280").text(addressLine);
    }
    if (hospital.phone) {
      doc.fontSize(9).fillColor("#6b7280").text(`Phone: ${hospital.phone}`);
    }

    doc.moveDown(0.5);
    doc.strokeColor("#e5e7eb").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.8);

    doc.fontSize(14).fillColor("#111827").text(title);
    if (subtitle) {
      doc.fontSize(10).fillColor("#374151").text(subtitle);
    }
    doc.moveDown(1);
  }

  section(heading) {
    this.doc.moveDown(0.6).fontSize(12).fillColor("#111827").text(heading);
    this.doc.moveDown(0.3);
    return this;
  }

  // pairs: [['Label', value], ...]
  keyValueGrid(pairs) {
    const { doc } = this;
    doc.fontSize(10);
    pairs.forEach(([label, value]) => {
      doc
        .fillColor("#374151")
        .text(`${label}: `, { continued: true })
        .fillColor("#111827")
        .text(`${value ?? "-"}`);
    });
    doc.moveDown(0.5);
    return this;
  }

  table(headers, rows, colWidths) {
    const { doc } = this;
    const startX = 50;
    const tableWidth = 495;
    let y = doc.y;
    const widths = colWidths || headers.map(() => tableWidth / headers.length);

    const drawRow = (cells, isHeader = false, striped = false) => {
      let x = startX;
      if (isHeader) {
        doc.rect(startX, y, tableWidth, 20).fill("#374151");
      } else if (striped) {
        doc.rect(startX, y, tableWidth, 20).fill("#f9fafb");
      }
      doc.fillColor(isHeader ? "#ffffff" : "#111827").fontSize(9);
      cells.forEach((cell, i) => {
        doc.text(String(cell ?? "-"), x + 4, y + 5, { width: widths[i] - 8 });
        x += widths[i];
      });
      y += 22;
    };

    drawRow(headers, true);
    rows.forEach((row, idx) => {
      if (y > 760) {
        doc.addPage();
        y = 50;
      }
      drawRow(row, false, idx % 2 === 1);
    });

    doc.y = y + 10;
    return this;
  }

  _footerPageNumbers() {
    const range = this.doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      this.doc.switchToPage(i);
      this.doc
        .fontSize(8)
        .fillColor("#9ca3af")
        .text(`Page ${i + 1} of ${range.count} · Generated ${new Date().toLocaleString()}`, 50, 800, {
          align: "center",
          width: 495,
        });
    }
    return this;
  }

  // Stream directly to an Express response (for GET .../report/pdf endpoints)
  toStream(res, filename) {
    this._footerPageNumbers();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    this.doc.pipe(res);
    this.doc.end();
  }

  // Get a Buffer instead (for emailing the PDF, saving to disk/S3, etc.)
  toBuffer() {
    this._footerPageNumbers();
    return new Promise((resolve, reject) => {
      const chunks = [];
      this.doc.on("data", (c) => chunks.push(c));
      this.doc.on("end", () => resolve(Buffer.concat(chunks)));
      this.doc.on("error", reject);
      this.doc.end();
    });
  }
}

export default PdfBuilder;