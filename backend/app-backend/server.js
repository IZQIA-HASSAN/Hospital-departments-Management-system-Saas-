import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./models/index.js";
import authRoutes from "./routes/auth.route.js";

const { sequelize } = db;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "backend is running" });
});

sequelize.authenticate()
  .then(() => console.log("postgres connected via sequelize"))
  .catch(err => console.log("unable to connect", err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});