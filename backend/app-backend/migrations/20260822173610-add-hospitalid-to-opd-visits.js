'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('opd_visits', 'hospitalId', {
      type: Sequelize.UUID,
      allowNull: true, // existing rows have no hospital assigned yet — see note below
      references: { model: 'hospitals', key: 'id' },
    });

    await queryInterface.addIndex('opd_visits', ['hospitalId', 'visitDate', 'tokenNumber'], {
      unique: true,
      name: 'opd_visits_hospital_date_token_unique',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('opd_visits', 'opd_visits_hospital_date_token_unique');
    await queryInterface.removeColumn('opd_visits', 'hospitalId');
  },
};