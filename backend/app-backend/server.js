import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http"; // ADDED: needed to create the raw server Socket.io attaches to
import { Server } from "socket.io";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import Hospitalroutes from "./routes/Hospitalroutes.js";
import Staffroutes from "./routes/Staffroutes.js";
import initsocket from "./utils/Socketmanager.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", Hospitalroutes);
app.use("/api/staff", Staffroutes);


const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" },
});

// Make io available inside controllers via req.app.get('io')
app.set("io", io);

initsocket(io);

sequelize
  .authenticate()
  .then(() => {
    console.log("Postgres connected");
    
    server.listen(process.env.PORT, () =>
      console.log(`Server running on ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("DB connection failed:", err));