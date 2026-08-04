'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define associations here later if needed
    }
  }
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.string,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false

    },
    role: {
      type: DataTypes.ENUM('staff', 'admin'),
      allowNull: false,
      defaultValue: 'staff'
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  // let hash passowrd automatically whenever it is set

  const bcrypt = require('bcryptjs')
  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10)
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10)
    }
  });

  User.prototype.comparePassword = function (plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  };

  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password; // never send the hash to the frontend
    return values;
  };

  return User;
};

