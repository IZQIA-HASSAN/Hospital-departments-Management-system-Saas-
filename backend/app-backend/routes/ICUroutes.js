import express from "express";
import {
  addPatient,
  getPatients,
  getPatientById,
  updatePatient,
  dischargePatient,
  markBedReady,
  deleteBed,
  getStats,
} from "../controllers/ICUcontroller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";
import { attachHospitalId } from "../middleware/Resolvehospital.js";

// This router assumes it is mounted as:
//   app.use("/api/icu", icuRouter);
// in app.js. All paths below are relative to that, e.g. router.get("/")
// becomes GET /api/icu — NOT /api/icu/icu. If you previously had routes
// defined as router.get("/icu", ...) here, that was the bug: it doubled
// up with the "/api/icu" mount prefix and forced the frontend to call
// http://localhost:5000/api/icu/icu as a workaround. Adjust API_BASE in
// the frontend accordingly (see frontend/ICUcontent.jsx).
//
// attachHospitalId runs on every route, right after protect: it resolves
// req.hospitalId from the authenticated user (admin -> Hospital.adminId,
// staff -> Staff.hospitalId) so the controller never trusts a hospitalId
// the client could have sent in the body/query.
const router = express.Router();

router.use(protect, attachHospitalId);

// /stats must come before /:id or Express will try to treat "stats" as a
// bed id and 404/500 on the findByPk lookup.
router.get("/stats", getStats);

router.get("/", getPatients);
router.get("/:id", getPatientById);

router.post("/", authorize("admin", "staff"), addPatient);
router.patch("/:id", authorize("admin", "staff"), updatePatient);

router.post("/:id/discharge", authorize("admin", "staff"), dischargePatient);
router.post("/:id/ready", authorize("admin", "staff"), markBedReady);

router.delete("/:id", authorize("admin"), deleteBed);

export default router;