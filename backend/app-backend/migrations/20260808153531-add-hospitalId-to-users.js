'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'hospitalId', {
      type: Sequelize.INTEGER, // match your model's type
      allowNull: true,
      references: { model: 'hospitals', key: 'id' }, // if it's a foreign key
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'hospitalId');
  }
};
