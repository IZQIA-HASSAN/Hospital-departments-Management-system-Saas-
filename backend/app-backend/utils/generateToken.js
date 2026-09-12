import jwt from "jsonwebtoken";

export const generateaccessToken = (account , accountType) =>
  jwt.sign({ id: account.id ,type:accountType },
     process.env.JWT_ACCESS_SECRET,
      {expiresIn: "15m",}
);

export const generaterefreshToken = (account , accountType)=>{
return jwt.sign({id:account.id , type:accountType} , process.env.JWT_REFRESH_SECRET , {expiresIn:"7d"})
}

