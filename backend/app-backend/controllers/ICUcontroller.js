import IcuBed from "../models/ICUvisit.js";
import Staff from "../models/Staff.js";

const VALID_SEVERITIES = ["critical", "serious", "stable"];
const VALID_GENDERS = ["male", "female", "other"];
const VALID_DISPOSITIONS = ["discharged", "transferred", "deceased"];

// POST /api/icu
// Admits a patient into a bed. hospitalId comes from req.hospitalId
// (attachHospitalId middleware) — never from the request body — so a user
// can only ever admit into their own hospital.
// Beds are physical and persistent (see models/ICUvisit.js), so this does
// NOT always create a new row:
//   - If bedNumber already exists for this hospital and is "vacant",
//     that row is reused/updated for the new admission.
//   - If bedNumber already exists but is "occupied" or "cleaning", the
//     request is rejected — you can't admit into a bed that's in use.
//   - Only if bedNumber has never been seen for this hospital is a new
//     bed row created.
// Expects: bedNumber, patientName, age, gender, and optionally contact,
// diagnosis, severity, assignedStaffId.
export const addPatient = async (req, res) => {
  try {
    const {
      bedNumber,
      patientName,
      age,
      gender,
      contact,
      diagnosis,
      severity,
      assignedStaffId,
    } = req.body;
    const hospitalId = req.hospitalId;

    const missing = [];
    if (!bedNumber) missing.push("bedNumber");
    if (!patientName) missing.push("patientName");
    if (!age) missing.push("age");
    if (missing.length) {
      return res.status(400).json({
        error: `Missing required field(s): ${missing.join(", ")}`,
      });
    }
    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ error: `gender must be one of: ${VALID_GENDERS.join(", ")}` });
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: `severity must be one of: ${VALID_SEVERITIES.join(", ")}` });
    }
    if (assignedStaffId) {
      const staff = await Staff.findByPk(assignedStaffId);
      if (!staff || staff.hospitalId !== hospitalId) {
        return res.status(404).json({ error: "Staff member not found" });
      }
    }

    let bed = await IcuBed.findOne({ where: { hospitalId, bedNumber } });

    if (bed) {
      if (bed.status !== "vacant") {
        return res.status(409).json({
          error: `Bed ${bedNumber} is currently ${bed.status} and cannot accept a new patient`,
        });
      }
      await bed.update({
        patientName,
        age,
        gender: gender || null,
        contact: contact || null,
        diagnosis: diagnosis || null,
        severity: severity || "stable",
        assignedStaffId: assignedStaffId || null,
        status: "occupied",
        admittedAt: new Date(),
        dischargedAt: null,
        disposition: null,
      });
    } else {
      try {
        bed = await IcuBed.create({
          bedNumber,
          patientName,
          age,
          gender: gender || null,
          contact: contact || null,
          diagnosis: diagnosis || null,
          severity: severity || "stable",
          hospitalId,
          assignedStaffId: assignedStaffId || null,
          status: "occupied",
          admittedAt: new Date(),
        });
      } catch (createErr) {
        // Two concurrent requests could both pass the findOne check above
        // for a brand-new bed number; the DB-level unique index (hospitalId,
        // bedNumber) catches that race and we surface it as a normal 409.
        if (createErr.name === "SequelizeUniqueConstraintError") {
          return res.status(409).json({ error: `Bed ${bedNumber} already exists for this hospital` });
        }
        throw createErr;
      }
    }

    return res.status(201).json(bed);
  } catch (err) {
    console.error("addPatient error:", err);
    return res.status(500).json({ error: "Failed to add patient" });
  }
};

// GET /api/icu
// Lists ICU beds/patients, always scoped to the caller's own hospital.
// Supports optional filtering via query params:
//   ?status=occupied  filter by bed status
//   ?severity=critical filter by patient severity
export const getPatients = async (req, res) => {
  try {
    const { status, severity } = req.query;
    const where = { hospitalId: req.hospitalId };
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const beds = await IcuBed.findAll({
      where,
      include: [{ model: Staff, as: "assignedStaff", attributes: ["id", "name", "role"] }],
      order: [["bedNumber", "ASC"]],
    });

    return res.json(beds);
  } catch (err) {
    console.error("getPatients error:", err);
    return res.status(500).json({ error: "Failed to fetch patients" });
  }
};

// GET /api/icu/:id
export const getPatientById = async (req, res) => {
  try {
    const bed = await IcuBed.findOne({
      where: { id: req.params.id, hospitalId: req.hospitalId },
      include: [{ model: Staff, as: "assignedStaff", attributes: ["id", "name", "role"] }],
    });
    if (!bed) return res.status(404).json({ error: "ICU bed not found" });
    return res.json(bed);
  } catch (err) {
    console.error("getPatientById error:", err);
    return res.status(500).json({ error: "Failed to fetch patient" });
  }
};

// PATCH /api/icu/:id
// Updates patient details on an occupied bed (diagnosis, severity, contact,
// reassigning staff). Does not change bed status — use discharge for that.
export const updatePatient = async (req, res) => {
  try {
    const bed = await IcuBed.findOne({ where: { id: req.params.id, hospitalId: req.hospitalId } });
    if (!bed) return res.status(404).json({ error: "ICU bed not found" });
    if (bed.status !== "occupied") {
      return res.status(409).json({ error: "This bed has no active patient to update" });
    }

    const { patientName, age, gender, contact, diagnosis, severity, assignedStaffId } = req.body;

    if (gender && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ error: `gender must be one of: ${VALID_GENDERS.join(", ")}` });
    }
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: `severity must be one of: ${VALID_SEVERITIES.join(", ")}` });
    }
    if (assignedStaffId) {
      const staff = await Staff.findByPk(assignedStaffId);
      if (!staff || staff.hospitalId !== req.hospitalId) {
        return res.status(404).json({ error: "Staff member not found" });
      }
    }

    await bed.update({
      ...(patientName !== undefined && { patientName }),
      ...(age !== undefined && { age }),
      ...(gender !== undefined && { gender }),
      ...(contact !== undefined && { contact }),
      ...(diagnosis !== undefined && { diagnosis }),
      ...(severity !== undefined && { severity }),
      ...(assignedStaffId !== undefined && { assignedStaffId }),
    });

    return res.json(bed);
  } catch (err) {
    console.error("updatePatient error:", err);
    return res.status(500).json({ error: "Failed to update patient" });
  }
};

// POST /api/icu/:id/discharge
// Discharges the patient and moves the bed into "cleaning" — it isn't
// available again until markBedReady is called. Staff assignment is
// cleared here too: the assignment was to the patient/bed pairing, and
// that pairing ends the moment the patient leaves.
export const dischargePatient = async (req, res) => {
  try {
    const { disposition } = req.body;
    if (disposition && !VALID_DISPOSITIONS.includes(disposition)) {
      return res.status(400).json({ error: `disposition must be one of: ${VALID_DISPOSITIONS.join(", ")}` });
    }

    const bed = await IcuBed.findOne({ where: { id: req.params.id, hospitalId: req.hospitalId } });
    if (!bed) return res.status(404).json({ error: "ICU bed not found" });
    if (bed.status !== "occupied") {
      return res.status(409).json({ error: "This bed has no active patient to discharge" });
    }

    await bed.update({
      status: "cleaning",
      dischargedAt: new Date(),
      disposition: disposition || "discharged",
      assignedStaffId: null,
    });

    return res.json(bed);
  } catch (err) {
    console.error("dischargePatient error:", err);
    return res.status(500).json({ error: "Failed to discharge patient" });
  }
};

// POST /api/icu/:id/ready
// Marks a cleaned bed vacant again, ready for the next admission. The bed
// row itself (id, bedNumber, hospitalId) is kept — only the patient
// snapshot fields are cleared — so addPatient can find and reuse it.
export const markBedReady = async (req, res) => {
  try {
    const bed = await IcuBed.findOne({ where: { id: req.params.id, hospitalId: req.hospitalId } });
    if (!bed) return res.status(404).json({ error: "ICU bed not found" });
    if (bed.status !== "cleaning") {
      return res.status(409).json({ error: "Bed is not currently in cleaning status" });
    }

    await bed.update({
      status: "vacant",
      patientName: null,
      age: null,
      gender: null,
      contact: null,
      diagnosis: null,
      severity: null,
      assignedStaffId: null,
      dischargedAt: null,
      disposition: null,
    });

    return res.json(bed);
  } catch (err) {
    console.error("markBedReady error:", err);
    return res.status(500).json({ error: "Failed to mark bed ready" });
  }
};

// DELETE /api/icu/:id
// Removes a bed record entirely (e.g. bed decommissioned). Rarely used —
// prefer discharge + markBedReady for the normal patient-turnover flow.
export const deleteBed = async (req, res) => {
  try {
    const bed = await IcuBed.findOne({ where: { id: req.params.id, hospitalId: req.hospitalId } });
    if (!bed) return res.status(404).json({ error: "ICU bed not found" });
    await bed.destroy();
    return res.status(204).send();
  } catch (err) {
    console.error("deleteBed error:", err);
    return res.status(500).json({ error: "Failed to delete bed" });
  }
};

// GET /api/icu/stats
// Occupancy summary for the caller's own hospital.
export const getStats = async (req, res) => {
  try {
    const beds = await IcuBed.findAll({
      where: { hospitalId: req.hospitalId },
      attributes: ["status", "severity"],
    });

    const stats = {
      total: beds.length,
      occupied: beds.filter((b) => b.status === "occupied").length,
      vacant: beds.filter((b) => b.status === "vacant").length,
      cleaning: beds.filter((b) => b.status === "cleaning").length,
      critical: beds.filter((b) => b.severity === "critical").length,
    };
    stats.occupancyRate = stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0;

    return res.json(stats);
  } catch (err) {
    console.error("getStats error:", err);
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
};