'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'hospitalId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'hospitals', key: 'id' },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'hospitalId');
  }
};
