// const jwt = require('jsonwebtoken')
import jwt from "jsonwebtoken"

const signToken  = (userId)=>{
    jwt.sign({sub :userId} , process.env.JWT_SECRET ,{
        expiresIn : process.env.JWT_EXPIRES_IN,

    })
}

const verifytkn = (token)=>jwt.verify(token , process.env.JWT_SECRET)

export{signToken , verifytkn}