import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Staff from "../models/Staff.js";   // uncomment/add this — no // in front

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
    console.log(token)
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

// import Staff from "../models/Staff.js"; // ADDED

// ...

export const signupStaff = async (req, res) => {
  try {
    const { token, password, name, title } = req.body;

    if (!token || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const decoded = jwt.verify(token, process.env.JWT_INVITE_SECRET);

    // FIX: check Staff, not User — that's where the record actually lives
    const existing = await Staff.findOne({ where: { email: decoded.email } });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // FIX: create a Staff row, matching the model getstaff/delstaff query
    const staff = await Staff.create({
      name,
      email: decoded.email,
      passwordHash,
      role: decoded.role,
      hospitalId: decoded.hospitalId,
    });

    const sessionToken = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ADDED: notify any admin dashboards live, same as addstaff used to
    const io = req.app.get('io');
    if (io) io.emit('staff:added', {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      isOnline: staff.isOnline,
      lastSeen: staff.lastSeen,
    });

    console.log(`new staff account created: ${staff.email}`);

    return res.status(201).json({
      message: "Signup successful",
      token: sessionToken,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    console.error("signupStaff error:", err);
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Invalid or expired invite link" });
    }
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

export const stafflogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // FIX: look up Staff, not User
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // FIX: compare against passwordHash, matching the Staff model's field name
    const passwordMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: staff.id, email: staff.email, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log(`staff member logged in: ${staff.email}`);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    console.error("stafflogin error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};