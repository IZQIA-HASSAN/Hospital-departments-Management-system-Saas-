import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, title } = req.body;

    if (!name || !email || !password || !title) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password,
      title,
      role: role === "admin" ? "admin" : "staff",
    });
    console.log("uuer created", user.name, user.email)

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, title: user.title },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.log("unable to create user , issues ", err.message)
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, title: user.title },

    });
    console.log("user logged in")
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.log(err.message)
  }
};

// verifying invite token 
export const verifyInvite = async (req, res) => {
  try {
    const { token } = req.query;
    const decoded = jwt.verify(token, process.env.JWT_INVITE_SECRET);
    res.status(200).json({ email: decoded.email, role: decoded.role });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired invite link" });
  }
};

// signup handle for staff
export const signupStaff = async (req, res) => {
  try {
    const { token, password, name, title } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_INVITE_SECRET); // throws if invalid/expired

    const existing = await User.findOne({ where: { email: decoded.email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      title,
      email: decoded.email,
      password: hashedPassword,
      role: decoded.role,        // "staff" — from token, not client input
      hospitalId: decoded.hospitalId, // from token, not client input
    });

    res.status(201).json({ message: "Signup successful", user });
  } catch (err) {
    console.error("signupStaff error:", err); // <-- see the real cause in your server logs
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Invalid or expired invite link" });
    }
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const stafflogin = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: " email and password are required" })
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "user not found, invalid email or password" })
    }

    const passwordmatch = await bcrypt.compare(password, user.password)
    if (!passwordmatch) {
      return res.status(400).json({ message: "password is incorrect , try again plzzz" })
    }

    const token = await jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      message: "login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
}