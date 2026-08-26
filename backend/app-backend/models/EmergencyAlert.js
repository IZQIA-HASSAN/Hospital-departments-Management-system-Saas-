// models/EmergencyAlert.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Hospital from "./Hospital.js";
import Notification from "./Notification.js";

const EmergencyAlert = sequelize.define(
  "EmergencyAlert",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    hospitalId: { type: DataTypes.UUID, allowNull: false },
    notificationId: { type: DataTypes.UUID, allowNull: true },
    patientName: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: true },
    info: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.ENUM("active", "resolved"), defaultValue: "active" },
    createdBy: { type: DataTypes.UUID, allowNull: true },
  },
  {
    tableName: "emergency_alerts",
    indexes: [{ fields: ["hospitalId", "createdAt"] }, { fields: ["hospitalId", "status"] }],
  }
);

EmergencyAlert.belongsTo(Hospital, { foreignKey: "hospitalId" });
EmergencyAlert.belongsTo(Notification, { foreignKey: "notificationId" });

export default EmergencyAlert;