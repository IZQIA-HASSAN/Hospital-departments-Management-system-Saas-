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
    // ADDED: staff login credential. Never store raw passwords — this holds
    // a bcrypt hash only. Excluded from API responses in the controller.
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'staff', // e.g. staff, manager, admin
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