import jwt from "jsonwebtoken";

const generateToken = (account , accountType) =>
  jwt.sign({ id: account.id ,type:accountType },
     process.env.JWT_SECRET,
      {expiresIn: "15m",}
);

const generaterefreshToken = (account , accountType)=>{
return jwt.sign({id:account.id , type:accountType} , process.env.JWT_REFRESH_SECRET , {expiresIn:"7d"})
}

export default {generateToken , generaterefreshToken};