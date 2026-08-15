import bcrypt from 'bcryptjs';
import Staff from '../models/Staff.js';
import Hospital from '../models/Hospital.js'; // ADDED
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// getting staff members
export const getstaff = async (req, res) => {
  try {
    // FIX: req.user.hospitalId never existed — look up via Hospital.adminId
    const hospital = await Hospital.findOne({ where: { adminId: req.user.id } });
    if (!hospital) {
      return res.status(400).json({ message: "Create a hospital first" });
    }

    const staff = await Staff.findAll({
      where: { hospitalId: hospital.id },
      attributes: { exclude: ['passwordHash'] },
      order: [
        ['isOnline', 'DESC'],
        ['name', 'ASC'],
      ],
    });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// deleting staff member
export const delstaff = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findByPk(id);
    if (!staff) {
      return res.status(404).json({ error: 'staff not found' });
    }
    await staff.destroy();

    const io = req.app.get('io');
    if (io) io.emit('staff:deleted', id);

    res.json({ message: 'staff member is deleted', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const invitestaff = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "email is required" });

    // FIX: req.user.hospitalId never existed — look up via Hospital.adminId
    const hospital = await Hospital.findOne({ where: { adminId: req.user.id } });
    if (!hospital) {
      return res.status(400).json({ message: "Create a hospital before inviting staff" });
    }

    const token = jwt.sign(
      { email, hospitalId: hospital.id, role: "staff" },
      process.env.JWT_INVITE_SECRET,
      { expiresIn: '3d' }
    );

    const link = `${process.env.FRONTEND_URL}/staff-signup?token=${token}`;

    await sendEmail({
      to: email,
      subject: "you are invited to join as staff",
      html: `
      <p>You have been invited to join as a staff member</p>
      <p><a href="${link}">Click here to complete your signup!</a></p>
      <p>this link expires in 3 days</p>
      `
    });

    res.status(200).json({ message: "invite sent successfully" });
    console.log("a staff member has been invited");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send invite" });
  }
};