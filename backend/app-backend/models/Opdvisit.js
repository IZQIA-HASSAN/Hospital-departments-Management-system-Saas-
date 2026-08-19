import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // adjust path to your sequelize instance

const OPDVisit = sequelize.define(
  "OPDVisit",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    patientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: false,
    },
    contact: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING, // e.g. "General", "Cardiology", "Orthopedics"
      allowNull: false,
    },
    doctorName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tokenNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    visitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("waiting", "in-progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "waiting",
    },
  },
  {
    tableName: "opd_visits",
    timestamps: true,
  }
);

export default OPDVisit;