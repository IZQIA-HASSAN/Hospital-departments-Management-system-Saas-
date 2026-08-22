import Hospital from "../models/Hospital.js";

// Must run AFTER `protect` (needs req.user). Attaches req.hospitalId so
// downstream controllers never have to trust a hospitalId the client sent
// in the body/query — that would let one hospital's staff/admin read or
// write another hospital's data just by changing a value in the request.
//
//   - staff: hospitalId is stored directly on the Staff row (set at
//     signupStaff time from the invite token).
//   - admin: hospitalId isn't stored on the User at all — it's resolved
//     via Hospital.adminId, same lookup as getmyhospital().
export const attachHospitalId = async (req, res, next) => {
  try {
    if (req.user.role === "staff") {
      if (!req.user.hospitalId) {
        return res.status(403).json({ message: "This staff account isn't linked to a hospital" });
      }
      req.hospitalId = req.user.hospitalId;
      return next();
    }

    const hospital = await Hospital.findOne({ where: { adminId: req.user.id } });
    if (!hospital) {
      return res.status(403).json({ message: "No hospital is registered for this account yet" });
    }
    req.hospitalId = hospital.id;
    next();
  } catch (err) {
    console.error("attachHospitalId error:", err);
    res.status(500).json({ message: "Server error" });
  }
};