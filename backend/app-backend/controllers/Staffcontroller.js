import User from "../models/User.js";
import Hospital from "../models/Hospital.js";

export const createstaff = async(req, res)=>{
    try{
        const {name , email  ,password , title} = req.body;

        if(!name || !email || !password || !title){
            return res.status(400).json({message : "All fields are required"})
        }
    }catch(err){
        
    }
}