import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Hospital from "./Hospital.js";

// Notifications are shared at the hospital level (per your call) — every
// admin/staff at a hospital sees the same feed and the same read state.
// `read` is a single boolean, not per-user: whoever clicks a notification
// or hits "mark all read" marks it read for the whole hospital. If you
// later want per-user read state, this is the field that'd need to become
// a join table (NotificationRead: notificationId, userId) instead.
const Notification = sequelize.define(
  "Notification",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: Hospital, key: "id" },
    },
    type: {
      // e.g. "staff_login", "staff_logout", "staff_invited", "icu_critical"
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: true },
    priority: {
      type: DataTypes.ENUM("normal", "critical"),
      allowNull: false,
      defaultValue: "normal",
    },
    read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // free-form extra data for future deep-linking, e.g. { staffId } or { bedId }
    metadata: { type: DataTypes.JSON, allowNull: true },
  },
  { tableName: "notifications", timestamps: true }
);

Hospital.hasMany(Notification, { foreignKey: "hospitalId", as: "notifications" });
Notification.belongsTo(Hospital, { foreignKey: "hospitalId", as: "hospital" });

export default Notification;