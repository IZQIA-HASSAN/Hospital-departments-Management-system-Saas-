import Staff from "../models/Staff.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// GET /api/staff
export const getstaff = async (req, res) => {
  try {
    const staff = await Staff.findAll({
      where: { hospitalId: req.hospitalId },
      attributes: { exclude: ["passwordHash"] },
      order: [
        ["isOnline", "DESC"],
        ["name", "ASC"],
      ],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/staff/:id
// Previously looked up by id alone — any admin could delete any hospital's
// staff member just by knowing/guessing their UUID. Now scoped so a staff
// row from a different hospital simply doesn't match and 404s.
export const delstaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findOne({ where: { id, hospitalId: req.hospitalId } });
    if (!staff) {
      return res.status(404).json({ error: "staff not found" });
    }
    await staff.destroy();

    // Scoped to this hospital's room only — previously io.emit() broadcast
    // to every connected browser regardless of hospital.
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