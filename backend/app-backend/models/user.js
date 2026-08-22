import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      // Users are always admins now (signup no longer accepts a role from
      // the client — see authController.js). Kept as an enum with "staff"
      // still allowed for now so existing rows don't break on load; drop
      // "staff" from this enum and default once you've migrated/verified
      // no User row has role: "staff" left in the DB.
      type: DataTypes.ENUM("admin", "staff"),
      defaultValue: "admin",
      allowNull: false,
    },
    title: { type: DataTypes.STRING, allowNull: false },

    // DEPRECATED — unused now. An admin's hospital is resolved via
    // Hospital.adminId (see middleware/resolveHospital.js), never read
    // from here. Left in place rather than silently dropped, since
    // removing a column is a migration decision, not something to do
    // quietly in a model file. Safe to drop via migration once confirmed
    // nothing else reads it.
    hospitalId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

User.prototype.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default User;