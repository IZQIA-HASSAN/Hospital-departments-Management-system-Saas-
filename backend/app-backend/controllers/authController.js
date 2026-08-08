import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

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
    console.log("uuer created" , user.name , user.email)

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, title: user.title },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
    console.log("unable to create user , issues " , err.message)
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
  }
};

