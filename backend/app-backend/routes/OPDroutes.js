import express from "express"
import { registeropdvisit, getOPDVisitById, updatevisitstatus, deleterecord, getopdvisits, todayslivequeue } from "../controllers/OPDcontroller.js"
import { protect } from "../middleware/auth.js" // adjust path to wherever your protect middleware actually lives
import { attachHospitalId } from "../middleware/resolveHospital.js" // adjust path to match your project

const router = express.Router()

router.get("/", protect, attachHospitalId, getopdvisits)
router.get("/queue/today", protect, attachHospitalId, todayslivequeue) // was documented but never wired up per the doc — added here
router.post("/register-visit", protect, attachHospitalId, registeropdvisit)
router.get("/getopd-vist/:id", protect, attachHospitalId, getOPDVisitById)
router.patch("/update-visit-status/:id", protect, attachHospitalId, updatevisitstatus)
router.delete("/:id", protect, attachHospitalId, deleterecord)

export default router