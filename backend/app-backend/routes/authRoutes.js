import express from "express";
import { signup , verifyInvite , signupStaff , unifiedLogin , forgotPassword , resetPassword  } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";
import { logout } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", unifiedLogin);
router.get("/verify-invite", verifyInvite);
router.post("/signup-staff", signupStaff);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout" , protect , logout)


router.get("/admindash", protect, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

export default router;