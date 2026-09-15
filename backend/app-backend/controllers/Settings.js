import bcrypt from "bcryptjs"
import User from "../models/User.js"
import Staff from "../models/Staff.js"
import Hospital from "../models/Hospital.js"
import { changeEmailSchema } from "../schemas/auth_schema.js"
import { changePasswordSchema } from "../schemas/auth_schema.js"
import { resolveHospitalId } from "../middleware/resolveHospital.js"

export const ChangeEmail = async (req, res) => {
    try {
        const result = changeEmailSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors,
            })
        }
    
        const { email } = result.data
        const Model = req.accountType === "staff" ? Staff : User

        const exists = await Model.findOne({ where: { email } })
        if (exists) {
            return res.status(400).json({ message: "email already in use " })
        }
        req.user.email = email
        await req.user.save();
        return res.json({ message: "Email is updated", email: req.user.email })
        console.log("email is updated successfully !")
    } catch (err) {
        console.error("change email error", err)
        res.status(500).json({ message: "Server error" })

    }
}

export const changePassword = async (req, res) => {
    try {
        const result = changePasswordSchema.safeParse(req.body)
        if (!result.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: result.error.flatten().fieldErrors
            })
        }

        const { currentPassword, newPassword } = result.data

        if (req.accountType !== "staff" && req.accountType !== "admin") {
            return res.status(403).json({ message: "Not authorized to change password" })
        }

        const match = await bcrypt.compare(currentPassword, req.user.password)
        if (!match) {
            return res.status(400).json({ message: "current password is incorrect" })
        }

        req.user.password = await bcrypt.hash(newPassword, 10)
        await req.user.save()

        return res.json({ message: "Password updated successfully" })
    } catch (err) {
        console.error("change password error", err)
        res.status(500).json({ message: "Server error" })
    }
}

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