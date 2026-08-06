import "dotenv/config";
import express from "express";
import cors from "cors";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import Hospitalroutes from "./routes/Hospitalroutes.js"

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());



app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("Postgres connected");
    app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT}`));
  })
  .catch((err) => console.error("DB connection failed:", err));