import express from "express";
import { signup, login, me } from "../controllers/auth.controller.js";
import { requireauth , requirerole } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/signup/staff' , requireauth , requirerole('admin') , listStaffHandler);
router.post('/login', login);
router.post('/me', requireauth, me);

export default router;