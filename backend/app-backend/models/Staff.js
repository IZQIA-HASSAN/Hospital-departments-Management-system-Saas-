import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Staff = sequelize.define(
  'Staff',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'staff',
    },
    // ADDED: without this, staff can't be scoped to the hospital that
    // invited them — getstaff had no way to filter per-admin.
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastSeen: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    socketId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'staff',
    timestamps: true,
  }
);

export default Staff;