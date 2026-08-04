import { verifytkn } from "../utils/jwt.js";
import db from "../models/index.js";

const { User } = db;

const requireauth = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = verifytkn(token);
        req.user = await User.findByPk(decoded.sub);
        if (!req.user) return res.status(401).json({ message: "User no longer exists" });
        next();
    } catch {
        res.status(401).json({ message: "token has already expired or invalid" });
    }
};

// require role 

const requirerole = async(...allowedRoles)=>{
    return (req, res, next)=>{
        if(!req.user) return res.status(401).json({message : "not authenticated"})
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({message : "you donot have permission to access this "})
        }    
        next()
    }
}

export { requireauth , requirerole };