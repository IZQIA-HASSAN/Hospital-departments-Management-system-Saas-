import express from "express";
import { signup, login, me } from "../controllers/auth.controller.js";
import { requireauth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/me', requireauth, me);

export default router;