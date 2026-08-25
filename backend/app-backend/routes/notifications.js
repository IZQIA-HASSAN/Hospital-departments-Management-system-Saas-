import express from "express"
import {protect} from "../middleware/auth.js"
import {resolveHospitalId} from  "../middleware/resolveHospital.js"
import Notification from "../models/Notification.js"
import {notify , initnotify}  from  "../utils/notificationService.js"
import { Op } from "sequelize"


const router = express.Router()

router.use(protect , resolveHospitalId)

router.get("/" , async(req ,res)=>{
    const {unreadOnly , limit = 30} = req.query
    const where = {hospitalId : req.hospitalId}

    if(unreadOnly === "true") where.read = false;

    const notification = await Notification.findAll({
        where , 
        order : [["createdAt" , "DESC"]],
        limit : Number(limit)

    })
    res.json(notification)
})

router.patch("/:id/read" , async(req , res)=>{
    const [updateCount , updateRows] = await Notification.update(
        {read : true},
        {
            where : {id :req.params.id , hospitalId : req.hospitalId},
            returning : true
        }
    );

    if(updateCount === 0) return res.status(404).json({error : "Not found"})

         const notification =
    updateRows?.[0] ||
    (await Notification.findOne({ where: { id: req.params.id, hospitalId: req.hospitalId } }));

  res.json(notification);
})

// PATCH /api/notifications/read-all
router.patch("/read-all", async (req, res) => {
  await Notification.update(
    { read: true },
    { where: { hospitalId: req.hospitalId, read: false } }
  );
  res.json({ success: true });
});

router.post("/emergency", async (req, res) => {
//   const { notify } = require("../services/notificationService");
  const { message, location } = req.body;

  const notification = await notify({
    hospitalId: req.hospitalId,
    type: "emergency",
    message: message || `Emergency alert${location ? ` — ${location}` : ""}`,
    severity: "critical",
    meta: { location },
    createdBy: req.user.id,
  });

  res.status(201).json(notification);
});

export default router