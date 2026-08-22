// Checks WHICH KIND of account this is (admin vs staff) — not their job
// title. Usage is unchanged at call sites: authorize("admin"),
// authorize("admin", "staff"), etc. Requires `protect` to have run first
// (sets req.accountType).
export const authorize = (...allowedTypes) => (req, res, next) => {
  if (!allowedTypes.includes(req.accountType)) {
    return res.status(403).json({ message: `Requires account type: ${allowedTypes.join(", ")}` });
  }
  next();
};