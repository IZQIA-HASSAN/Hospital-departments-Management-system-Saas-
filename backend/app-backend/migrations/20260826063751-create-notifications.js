'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      hospitalId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
          'staff_login',
          'staff_logout',
          'emergency',
          'patient_critical',
          'patient_admitted',
          'patient_discharged',
          'bed_ready'
        ),
        allowNull: false,
      },
      message: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      severity: {
        type: Sequelize.ENUM('info', 'warning', 'critical'),
        defaultValue: 'info',
      },
      meta: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('notifications', ['hospitalId', 'createdAt']);
    await queryInterface.addIndex('notifications', ['hospitalId', 'read']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
    // Sequelize doesn't auto-drop ENUM types on table drop for Postgres —
    // clean them up explicitly, or a future `db:migrate` re-run trying to
    // recreate these same ENUM names will fail because they still exist.
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_notifications_severity";');
  },
};