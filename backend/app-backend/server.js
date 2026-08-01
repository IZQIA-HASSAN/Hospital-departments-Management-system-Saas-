import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./models/index.js";
const { sequelize } = db;


dotenv.config();
const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());



app.get("/api/health" , (req, res)=>{
    req.json({status:"ok" , messgage : "backend is running"})
})

sequelize.authenticate().then(()=> console.log("postgres connected via sequelize")).catch(err=> console.log("unable to connect" ,err))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});