import db from "../models/index.js";
const { User } = db;
import { signToken } from "../utils/jwt.js";

// a woking signup function creating a user and issuing a signin token 

const signup = async (req, res)=>{
    try{
        const {name , email , password} = req.body
        const existing = await User.findOne({where : {email}})
        if(existing) return res.status(409).json({message :'Email already registered'})

            const user = await User.create({name , email , password})
            const token = signToken(user.id)
            res.status(201).json({token , user})


    }catch(err){
res.status(500).json({message : err.message})
    }
}

// a login function and issuing jwt token

const login  = async(req, res)=>{
    try{
        const {email , password} = req.body;

        const user  = await User.findOne({where : {email}})

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({message : "invalid email or password"})
        }
        const token  = signToken(user.id)
        res.json({token, user})


    }catch(err){
res.status(500).json({message :err.message})
    }
}

// me function

const me = async (req, res) => res.json({user:req.user})

export {signup , login ,me}