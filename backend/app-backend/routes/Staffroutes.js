import express from 'express';

const router = express.Router();

import {
  delstaff,
  getstaff,
  addstaff,
} from '../controllers/Staffcontroller.js';

// register routes

// FIX: all three were `router.get(...)` — GET can't create or delete
// anything, and two GET "/" handlers meant the second was unreachable.
// addstaff now POST, delstaff now DELETE.
router.get('/', getstaff);
router.post('/', addstaff);
router.delete('/:id', delstaff);

// FIX: `module.exports = router` was CommonJS syntax in an ESM file —
// this is what Node's ESM loader would choke on next.
export default router;