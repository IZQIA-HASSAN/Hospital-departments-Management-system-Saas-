'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('staff', 'admin'),
      allowNull: false,
      defaultValue: 'staff',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'title');
    await queryInterface.removeColumn('Users', 'role');
    // Postgres leaves the enum type behind after removeColumn — drop it explicitly
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_role";');
  },
};