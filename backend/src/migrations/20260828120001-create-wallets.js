"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallets", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      ads_balance: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      security_deposit: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("now()"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("now()"),
      },
    });

    await queryInterface.addConstraint("wallets", {
      fields: ["balance"],
      type: "check",
      name: "chk_wallets_balance_nonneg",
      where: { balance: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint("wallets", {
      fields: ["ads_balance"],
      type: "check",
      name: "chk_wallets_ads_balance_nonneg",
      where: { ads_balance: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint("wallets", {
      fields: ["security_deposit"],
      type: "check",
      name: "chk_wallets_security_deposit_nonneg",
      where: { security_deposit: { [Sequelize.Op.gte]: 0 } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wallets");
  },
};
