// routes/reportRoutes.js
//
// Mount in your main app with: app.use('/api/reports', reportRoutes);
//
// Adjust the import paths below to match your actual middleware file names/exports.

import express from "express";
import { protect } from "../middleware/auth.js";
import { attachHospitalId } from "../middleware/resolveHospital.js";
import { generateReport, getAvailableReports, getDepartments } from "../controllers/ReportController.js";

const router = express.Router();

// Every route below is authenticated and tenant-scoped before it ever reaches
// the controller — no report handler has to re-derive hospitalId itself.
router.use(protect, attachHospitalId);

// GET /api/reports                                    -> list departments
// GET /api/reports/:department                        -> list report types for a department
// GET /api/reports/:department/:reportType            -> generate a report with no entity (e.g. bed-status, daily-queue)
// GET /api/reports/:department/:reportType/:entityId  -> generate a report scoped to one bed/visit
router.get("/", getDepartments);
router.get("/:department", getAvailableReports);
router.get("/:department/:reportType", generateReport);
router.get("/:department/:reportType/:entityId", generateReport);

export default router;