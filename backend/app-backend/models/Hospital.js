import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Hospital = sequelize.define(
  "Hospital",
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // one admin owns exactly one hospital
      references: { model: User, key: "id" },
    },
  },
  {
    tableName: "hospitals",
    timestamps: true,
  }
);

// Associations
User.hasOne(Hospital, { foreignKey: "adminId", as: "hospital" });
Hospital.belongsTo(User, { foreignKey: "adminId", as: "admin" });

export default Hospital;