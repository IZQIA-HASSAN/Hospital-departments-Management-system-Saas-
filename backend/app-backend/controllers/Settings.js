import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Staff from "../models/Staff.js"
import Hospital from "../models/Hospital.js"
import { changeEmailSchema } from "../schemas/auth_schema.js"
import { changePasswordSchema } from "../schemas/auth_schema.js"
import { resolveHospitalId } from "../middleware/resolveHospital.js"

export const ChangeEmail = async (req, res) => {
  try {
    // 1. Validate body input
    const result = changeEmailSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { oldEmail, newEmail, password } = result.data;

    // 2. Verify old email matches current user session
    if (req.user.email !== oldEmail) {
      return res.status(400).json({
        message: "Old email does not match our records!",
      });
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, req.user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Password does not match our records!",
      });
    }

    // 4. Check that newEmail is not taken in EITHER table
    const userExists = await User.findOne({ where: { email: newEmail } });
    const staffExists = await Staff.findOne({ where: { email: newEmail } });

    if (userExists || staffExists) {
      return res.status(400).json({ message: "Email is already taken" });
    }

    // 5. Update the specific table based on account type
    if (req.accountType === "staff") {
      const staffMember = await Staff.findByPk(req.user.id);
      if (!staffMember) return res.status(404).json({ message: "Staff not found" });

      staffMember.email = newEmail;
      await staffMember.save();
    } else {
      const adminUser = await User.findByPk(req.user.id);
      if (!adminUser) return res.status(404).json({ message: "User not found" });

      adminUser.email = newEmail;
      await adminUser.save();
    }

    // Keep session object up to date
    req.user.email = newEmail;

    return res.json({
      message: "Email updated successfully",
      email: newEmail,
    });
  } catch (err) {
    console.error("Change email error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// change password settings

export const changePassword = async (req, res) => {
  try {
    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { currentPassword, newPassword } = result.data;

    // Verify account type
    if (req.accountType !== "staff" && req.accountType !== "admin") {
      return res.status(403).json({ message: "Not authorized to change password" });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, req.user.password);
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Update password on req.user (works for both User and Staff models)
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
       

export const updateHospital = async (req, res) => {
    try {
        if (req.accountType !== "admin") {
            return res.status(403).json({ message: "Only admins can update hospital info" })
        }
        const hospitalid = await resolveHospitalId(req.user, "admin")
        if (!hospitalid) return res.status(404).json({ message: "No hospital found " })

        const hospital = await Hospital.findByPk(hospitalid)
        if (!hospital) return res.status(404).json({ message: "Hospital not found" })

        const { name, address, city, phone } = req.body
        if (name !== undefined) hospital.name = name
        if (address !== undefined) hospital.address = address
        if (city !== undefined) hospital.city = city
        if (phone !== undefined) hospital.phone = phone

        await hospital.save()
        return res.json({ message: "Hospital info updated", hospital })
    } catch (err) {
        console.error("updated hospital info error ", err)
        return res.status(500).json({ message: "Error updating the hospital" })
    }
}