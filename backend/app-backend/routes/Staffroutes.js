import express from "express";
import { invitestaff, delstaff, getstaff } from "../controllers/Staffcontroller.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";
// import { attachHospitalId } from "../middleware/resolveHospital.js";
import { attachHospitalId } from "../middleware/Resolvehospital.js";

const router = express.Router();

router.use(protect, authorize("admin"), attachHospitalId);

router.get("/", getstaff);
router.delete("/:id", delstaff);
router.post("/invite", invitestaff);

export default router;