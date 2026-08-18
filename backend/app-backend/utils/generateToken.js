import jwt from "jsonwebtoken";

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "20d",
  });

export default generateToken;