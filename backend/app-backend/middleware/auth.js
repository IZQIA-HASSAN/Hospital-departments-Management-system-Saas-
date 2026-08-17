import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Staff from "../models/Staff.js"

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if(!header || !header.startsWith("Bearer")){
    return res.status(401).json({message : "Not authorized , no token "})
  }
  try{
    const token  = header.split(" ")[1]
    const decoded = jwt.verify(token , process.env.JWT_SECRET )

    const account = decoded.role === "staff" ? await Staff.findByPk(decoded.id) : await users.findByPk(decoded.id);

    if(!account){
      return res.status(401).json({message : "user doesnot exists"})
    }

    req.user = account;
    next()
  }catch(err){
    res.status(401).json({ message: "Invalid token" });
  }
};