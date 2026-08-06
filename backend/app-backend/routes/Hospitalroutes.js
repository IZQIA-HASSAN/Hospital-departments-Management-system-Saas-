import express from "express";
import { createhospital, getmyhospital } from "../controllers/hospitalController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";

const router = express.Router();


router.post("/"  , protect , authorize("admin") , createhospital)
router.get("/me"  , protect , authorize("admin") , getmyhospital)

export default router