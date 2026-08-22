import Hospital from "../models/Hospital.js";

// accountType is "admin" or "staff" — pass req.accountType (set by
// protect) or the literal type you already know at login/signup time.
// Deliberately does NOT infer this from account.role anymore — that field
// is a job title now, not an account-kind signal.
export const resolveHospitalId = async (account, accountType) => {
  if (accountType === "staff") {
    return account.hospitalId || null;
  }
  const hospital = await Hospital.findOne({ where: { adminId: account.id } });
  return hospital ? hospital.id : null;
};

// Express middleware. Must run AFTER `protect` (needs req.user, req.accountType).
export const attachHospitalId = async (req, res, next) => {
  try {
    const hospitalId = await resolveHospitalId(req.user, req.accountType);
    if (!hospitalId) {
      return res.status(403).json({
        message:
          req.accountType === "staff"
            ? "This staff account isn't linked to a hospital"
            : "No hospital is registered for this account yet",
      });
    }
    req.hospitalId = hospitalId;
    next();
  } catch (err) {
    console.error("attachHospitalId error:", err);
    res.status(500).json({ message: "Server error" });
  }
};