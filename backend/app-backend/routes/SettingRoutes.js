import express from "express"
import { ChangeEmail , changePassword , updateHospital} from "../controllers/Settings.js"
import { protect } from "../middleware/auth.js"
import { authorize } from "../middleware/checkRole.js"

const router = express.Router()



router.patch("/email" , ChangeEmail)
router.patch("/password" , changePassword)
router.patch("/hospital" , protect ,authorize("admin") , updateHospital)

export default router