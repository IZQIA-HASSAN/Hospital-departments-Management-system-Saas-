import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Staff from "../models/Staff.js";

export const protect = async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

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