import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Staff from "../models/Staff.js";

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded.type is "admin" or "staff" — which table to query. This is
    // NOT the same thing as a business role/job title (Staff.role), which
    // can change independently without breaking login.
    const account =
      decoded.type === "staff"
        ? await Staff.findByPk(decoded.id)
        : await User.findByPk(decoded.id);

    if (!account) {
      return res.status(401).json({ message: "User does not exist" });
    }

    req.user = account;
    req.accountType = decoded.type === "staff" ? "staff" : "admin";
    next();
  } catch (err) {
    console.error("protect middleware error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};