import Staff from "../models/Staff.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

const STALE_MS = 30 * 1000; // no heartbeat/request in 30s => treated as offline

// GET /api/staff
export const getstaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: { hospitalId: req.hospitalId },
      attributes: { exclude: ["passwordHash"] },
      order: [["lastSeen", "DESC"], ["name", "ASC"]],
    });

    const now = Date.now();
    const result = staff.map((s) => {
      const plain = s.toJSON();
      const secondsSinceSeen = plain.lastSeen
        ? now - new Date(plain.lastSeen).getTime()
        : Infinity;
      // isOnline is computed here, not trusted from the stored column —
      // this is what makes tab-close/crash/no-logout self-correct without
      // needing to detect the disconnect event at all.
      plain.isOnline = secondsSinceSeen < STALE_MS;
      return plain;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/staff/heartbeat
// Body can be empty — protect middleware already refreshes lastSeen for
// any authenticated request. This route exists purely so the frontend has
// something cheap to ping on an interval even when the staff member isn't
// otherwise triggering requests.
export const heartbeat = (req, res) => {
  res.status(200).json({ ok: true });
};

// DELETE /api/staff/:id
export const delstaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOne({ where: { id, hospitalId: req.hospitalId } });
    if (!staff) {
      return res.status(404).json({ error: "staff not found" });
    }
    await staff.destroy();

    const io = req.app.get("io");
    if (io) io.to(`hospital:${req.hospitalId}`).emit("staff:deleted", id);

    res.json({ message: "staff member is deleted", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/staff/invite
export const invitestaff = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    const token = jwt.sign(
      { email, hospitalId: req.hospitalId, role: "staff" },
      process.env.JWT_INVITE_SECRET,
      { expiresIn: "3d" }
    );

    const link = `${process.env.FRONTEND_URL}/staff-signup?token=${token}`;

    await sendEmail({
      to: email,
      subject: "you are invited to join as staff",
      html: `
      <p>You have been invited to join as a staff member</p>
      <p><a href="${link}">Click here to complete your signup!</a></p>
      <p>this link expires in 3 days</p>
      `,
    });

    res.status(200).json({ message: "invite sent successfully" });
    console.log("a staff member has been invited");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send invite" });
  }
};