import { DataTypes } from "sequelize";
import bcrypt from "bcryptjs";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
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
    type: DataTypes.ENUM("admin", "staff"),
    defaultValue: "staff",
    allowNull: false,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  
hospitalId:{
type : DataTypes.UUID,
allowNull : true ,
}, // e.g. "HR Manager"
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
});

// Instance method to compare passwords
User.prototype.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default User;