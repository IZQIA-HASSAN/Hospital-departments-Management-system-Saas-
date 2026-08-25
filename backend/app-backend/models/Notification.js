import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Hospital from "./Hospital.js";
import Staff from "./Staff.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "staff_login",
        "staff_logout",
        "emergency",
        "patient_critical",
        "patient_admitted",
        "patient_discharged",
        "bed_ready"
      ),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM("info", "warning", "critical"),
      defaultValue: "info",
    },
    meta: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdBy: {
      type: DataTypes.UUID, // match your Staff PK type
      allowNull: true,
    },

  },
  {
    tableName: "notifications",
    indexes: [{ fields: ["hospitalId", "createdAt"] }, { fields: ["hospitalId", "read"] }],

  }

);


 Notification.belongsTo(Hospital, { foreignKey: "hospitalId" });
Notification.belongsTo(Staff, { foreignKey: "createdBy", as: "author" });

export default Notification;