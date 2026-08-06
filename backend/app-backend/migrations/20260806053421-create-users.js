"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: { type: Sequelize.STRING, allowNull: false },
      role: {
        type: Sequelize.ENUM("admin", "staff"),
        defaultValue: "staff",
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("users");
    // also drop the ENUM type Postgres creates for `role`
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
  },
};