"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("earnings", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      seller_id: {
        type: Sequelize.STRING,
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "INR",
      },

      earning_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "accrued",
      },
      reversed_earning_id: {
        type: Sequelize.BIGINT,
        references: { model: "earnings", key: "id" },
      },

      payment_id: {
        type: Sequelize.BIGINT,
        references: { model: "payments", key: "id" },
      },
      payment_cycle_id: {
        type: Sequelize.STRING,
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

    await queryInterface.addConstraint("earnings", {
      fields: ["amount"],
      type: "check",
      name: "chk_earnings_amount_nonneg",
      where: { amount: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint("earnings", {
      fields: ["earning_status"],
      type: "check",
      name: "chk_earnings_status_enum",
      where: {
        earning_status: {
          [Sequelize.Op.in]: ["accrued", "billed", "paid", "reversed"],
        },
      },
    });

    await queryInterface.addIndex("earnings", {
      fields: ["user_id", "earning_status"],
      name: "idx_earnings_user_status",
    });
    await queryInterface.addIndex("earnings", {
      fields: ["seller_id"],
      name: "idx_earnings_seller",
    });
    await queryInterface.addIndex("earnings", {
      fields: ["order_id"],
      name: "idx_earnings_order",
    });
    await queryInterface.addIndex("earnings", {
      fields: ["payment_id"],
      name: "idx_earnings_payment",
    });
    await queryInterface.addIndex("earnings", {
      fields: ["payment_cycle_id"],
      name: "idx_earnings_cycle",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("earnings");
  },
};
