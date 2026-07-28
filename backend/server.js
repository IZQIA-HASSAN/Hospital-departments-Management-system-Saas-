import express from "express";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config();
const app = express();
const PORT = process.env.PORT

app.use(cors());
app.use(express.json());



app.get("/api/health" , (req, res)=>{
    req.json({status:"ok" , messgage : "backend is running"})
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});