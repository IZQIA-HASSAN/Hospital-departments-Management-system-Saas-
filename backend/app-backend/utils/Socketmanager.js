// server/utils/Socketmanager.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken"; // was used in app.js but never imported — that alone would've crashed on first connection
import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";

// Staff rows store hospitalId directly. Admins (User) don't — their hospital
// is found by looking up the Hospital they own via adminId. Two different
// lookups because they're two different relationships in your schema.
async function resolveHospitalId(account, accountType) {
  if (accountType === "staff") {
    return account.hospitalId || null;
  }
  const hospital = await Hospital.findOne({ where: { adminId: account.id } });
  return hospital?.id || null;
}

export default async function initsocket(httpServer) {
  // Any staff row still marked online from before this process started is
  // guaranteed stale — a socket connected to the previous process instance
  // (killed by a nodemon restart, crash, or deploy) can't still be alive
  // here. Without this, isOnline gets stuck "true" forever whenever the
  // server dies before a clean disconnect fires.
  try {
    await Staff.update(
      { isOnline: false, socketId: null },
      { where: { isOnline: true } }
    );
  } catch (err) {
    console.error("Failed to reset stale staff presence on startup:", err.message);
  }

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Not authorized"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const accountType = decoded.type === "staff" ? "staff" : "admin";
      const account =
        accountType === "staff"
          ? await Staff.findByPk(decoded.id)
          : await User.findByPk(decoded.id);
      if (!account) return next(new Error("Not authorized"));

      const hospitalId = await resolveHospitalId(account, accountType);
      if (!hospitalId) return next(new Error("No hospital linked to this account"));

      socket.hospitalId = hospitalId;
      socket.accountType = accountType;
      socket.user = account;
      next();
    } catch (err) {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", async (socket) => {
    socket.join(`hospital:${socket.hospitalId}`);

    // presence tracking — only meaningful for staff (Staff has isOnline/
    // socketId/lastSeen columns; User/admin doesn't)
    if (socket.accountType === "staff") {
      try {
        await Staff.update(
          { isOnline: true, socketId: socket.id, lastSeen: new Date() },
          { where: { id: socket.user.id } }
        );
        // FIX: this update was never announced to anyone — the admin's
        // staff list listens for exactly this event and had nothing to
        // listen to.
        io.to(`hospital:${socket.hospitalId}`).emit("staff:statusChanged", {
          id: socket.user.id,
          isOnline: true,
        });
      } catch (err) {
        console.error("socket presence update (connect) failed:", err.message);
      }
    }

    socket.on("disconnect", async () => {
      if (socket.accountType !== "staff") return;
      try {
        const [updatedCount] = await Staff.update(
          { isOnline: false, lastSeen: new Date() },
          { where: { id: socket.user.id, socketId: socket.id } }
        );
        // Only announce "offline" if this disconnect actually cleared the
        // row — if the staff member already reconnected on a different
        // socket before this one disconnected, the WHERE clause matches
        // zero rows (socketId no longer matches) and we must NOT announce
        // offline, since they're still genuinely online via the newer socket.
        if (updatedCount > 0) {
          io.to(`hospital:${socket.hospitalId}`).emit("staff:statusChanged", {
            id: socket.user.id,
            isOnline: false,
          });
        }
      } catch (err) {
        console.error("socket presence update (disconnect) failed:", err.message);
      }
    });
  });

  registerIO(io);
  return io;
}

// Same singleton-getter pattern as before, so any controller can call
// notify() without needing the io instance passed down through every layer.
let ioInstance = null;
function registerIO(io) {
  ioInstance = io;
}
export function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized — call initsocket(httpServer) before getIO()");
  }
  return ioInstance;
}