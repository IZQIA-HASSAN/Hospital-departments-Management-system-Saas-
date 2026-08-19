import express from "express"
import { registeropdvisit, getOPDVisitById, updatevisitstatus, deleterecord, getopdvisits } from "../controllers/OPDcontroller.js"

const router = express.Router()

router.get("/", getopdvisits) //this will give all the visits 
router.post("/register-visit", registeropdvisit)
router.get("/getopd-vist/:id", getOPDVisitById) //this will give visits by id for filtering 
router.patch("/update-vist-status", updatevisitstatus)
router.delete("/:id", deleterecord)


export default router