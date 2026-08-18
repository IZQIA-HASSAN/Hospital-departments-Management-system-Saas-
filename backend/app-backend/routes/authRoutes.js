import express from "express";
import { signup , verifyInvite , signupStaff , unifiedLogin  } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/checkRole.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", unifiedLogin);
router.get("/verify-invite", verifyInvite);
router.post("/signup-staff", signupStaff);
// router.post("/staff-login", stafflogin);

router.get("/admindash", protect, authorize("admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

export default router;