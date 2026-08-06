import express from "express";
import { createHospital, getmyhospital, getMyHospital } from "../controllers/hospitalController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";

const router = express.Router();


router.post("/"  , protect , authorize("admin") , createHospital)
router.get("/me"  , protect , authorize("admin") , getmyhospital)