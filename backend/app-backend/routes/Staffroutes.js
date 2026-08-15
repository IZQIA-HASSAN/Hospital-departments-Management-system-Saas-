import express from 'express';
import { invitestaff } from '../controllers/Staffcontroller.js'
import { protect } from "../middleware/auth.js";
import { authorize } from '../middleware/checkrole.js';

const router = express.Router();

import {
  delstaff,
  getstaff,

} from '../controllers/Staffcontroller.js';


router.get('/', protect , authorize("admin") , getstaff);

router.delete('/:id',protect,authorize("admin") , delstaff);

router.post("/invite", protect, authorize("admin"), invitestaff)




export default router;