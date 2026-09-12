// server/utils/notificationService.js
import Notification from "../models/Notification.js";

export const notify = async ({ hospitalId, type, message, severity = "info", meta = {}, createdBy }) => {
  const notification = await Notification.create({
    hospitalId,
    type,
    message,
    severity,
    meta,
    createdBy,
  });

  return notification;
};