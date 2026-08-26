import express from "express"
import {protect} from "../middleware/auth.js"
import {attachHospitalId} from  "../middleware/resolveHospital.js"
import Notification from "../models/Notification.js"
import {notify }  from  "../utils/notificationService.js"
import EmergencyAlert from "../models/EmergencyAlert.js"
import { Op } from "sequelize"


const router = express.Router()

router.use(protect , attachHospitalId)

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
  const { patientName, age, info } = req.body;

  if (!patientName) {
    return res.status(400).json({ message: "Patient name is required" });
  }

  const ageText = age ? `, age ${age}` : "";
  const infoText = info ? ` — ${info}` : "";
  const message = `Emergency: ${patientName}${ageText}${infoText}`;

  const t = await sequelize.transaction();
  try {
    const alert = await EmergencyAlert.create(
      {
        hospitalId: req.hospitalId,
        patientName,
        age: age || null,
        info: info || null,
        createdBy: req.user.id,
      },
      { transaction: t }
    );

    // notify() does its own create + socket emit — call it inside the same
    // transaction context isn't strictly needed since it's a separate table,
    // but we do want alert.id available to link back
    const notification = await notify({
      hospitalId: req.hospitalId,
      type: "emergency",
      message,
      severity: "critical",
      meta: { alertId: alert.id, patientName, age: age || null, info: info || null },
      createdBy: req.user.id,
    });

    alert.notificationId = notification.id;
    await alert.save({ transaction: t });

    await t.commit();
    res.status(201).json({ alert, notification });
  } catch (err) {
    await t.rollback();
    console.error("Failed to create emergency alert:", err.message);
    res.status(500).json({ message: "Failed to send alert" });
  }
});

// GET /api/notifications/emergency/active
router.get("/emergency/active", async (req, res) => {
  const alerts = await EmergencyAlert.findAll({
    where: { hospitalId: req.hospitalId, status: "active" },
    order: [["createdAt", "DESC"]],
  });
  res.json(alerts);
});

// PATCH /api/notifications/emergency/:id/resolve
router.patch("/emergency/:id/resolve", async (req, res) => {
  const [updatedCount] = await EmergencyAlert.update(
    { status: "resolved" },
    { where: { id: req.params.id, hospitalId: req.hospitalId, status: "active" } }
  );

  if (updatedCount === 0) {
    return res.status(404).json({ message: "Active alert not found" });
  }

  const alert = await EmergencyAlert.findOne({
    where: { id: req.params.id, hospitalId: req.hospitalId },
  });

  // Let everyone in the hospital know this alert is handled, live
  try {
    const { getIO } = await import("../utils/Socketmanager.js");
    getIO().to(`hospital:${req.hospitalId}`).emit("emergency:resolved", { id: alert.id });
  } catch (err) {
    console.error("Failed to emit emergency:resolved:", err.message);
  }

  res.json(alert);
});

export default router