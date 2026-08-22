import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import sequelize from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import Hospitalroutes from "./routes/Hospitalroutes.js";
import Staffroutes from "./routes/Staffroutes.js";
import initsocket from "./utils/Socketmanager.js";
import OPDroutes from "./routes/OPDroutes.js";
import ICUroutes from "./routes/ICUroutes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hospitals", Hospitalroutes);
app.use("/api/staff", Staffroutes);
app.use("/api/opd", OPDroutes);
app.use("/api/icu", ICUroutes);

const server = http.createServer(app);
initsocket(server); // FIXED: this was imported but never called — Socket.io was never actually running

sequelize
  .authenticate()
  .then(() => {
    console.log("Postgres connected");
    return sequelize.sync();
  })
  .then(() => {
    console.log("Models synced");
    server.listen(process.env.PORT, () =>
      console.log(`Server running on ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("DB connection/sync failed:", err));