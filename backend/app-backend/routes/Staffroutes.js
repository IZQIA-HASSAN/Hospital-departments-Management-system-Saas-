import express from 'express';
import {invitestaff} from '../controllers/Staffcontroller.js'
import { signupStaff } from '../controllers/authController.js';
import { verifyInvite } from '../controllers/authController.js';
import { protect } from "../middleware/auth.js";
import { authorize } from '../middleware/checkrole.js';
import { stafflogin } from '../controllers/authController.js';
// import {addstaff ,  getstaff , delstaff  } from '../controllers/Staffcontroller.js';

const router = express.Router();

import {
  delstaff,
  getstaff,
  
} from '../controllers/Staffcontroller.js';

// register routes

// FIX: all three were `router.get(...)` — GET can't create or delete
// anything, and two GET "/" handlers meant the second was unreachable.
// addstaff now POST, delstaff now DELETE.
router.get('/', getstaff);
// router.post('/', addstaff);
router.delete('/:id', delstaff);

// FIX: `module.exports = router` was CommonJS syntax in an ESM file —
// this is what Node's ESM loader would choke on next.


router.post("/invite" , protect , authorize("admin") , invitestaff)

router.get("/verify-invite", verifyInvite);

router.post("/signup-staff", signupStaff);

router.post("/login" , stafflogin)


export default router;