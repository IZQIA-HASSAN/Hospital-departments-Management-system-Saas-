// server/utils/notificationService.js
import Notification from "../models/Notification.js";
import { getIO } from "./Socketmanager.js";

export const notify = async ({ hospitalId, type, message, severity = "info", meta = {}, createdBy }) => {
  const notification = await Notification.create({
    hospitalId,
    type,
    message,
    severity,
    meta,
    createdBy,
  });

  try {
    const io = getIO();
    io.to(`hospital:${hospitalId}`).emit("notification:new", notification);
  } catch (err) {
    // getIO() throws if socket.io hasn't initialized yet — don't let that
    // crash the HTTP request; the notification is already saved either way
    console.error("Failed to emit notification over socket:", err.message);
  }

  return notification;
};