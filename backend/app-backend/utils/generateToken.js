import jwt from "jsonwebtoken";

const generateToken = (account , accountType) =>
  jwt.sign({ id: account.id ,type:accountType }, process.env.JWT_SECRET, {
    expiresIn: "20d",
  });

export default generateToken;