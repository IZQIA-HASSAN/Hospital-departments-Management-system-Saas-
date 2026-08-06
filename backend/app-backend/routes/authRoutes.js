import express from "express";
import { signup, login } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/admindash", protect, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

export default router;