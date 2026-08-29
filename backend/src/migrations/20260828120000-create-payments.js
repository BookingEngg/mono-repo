"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },

      seller_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      order_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      payable_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.TEXT,
        allowNull: false,
        defaultValue: "INR",
      },

      transaction_id: {
        type: Sequelize.TEXT, // partner/gateway order id
      },

      online_request: {
        type: Sequelize.JSONB,
      },
      online_response: {
        type: Sequelize.JSONB,
      },

      payment_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "initiated",
      },
      payment_gateway: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_cycle_id: {
        type: Sequelize.TEXT,
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

    await queryInterface.addConstraint("payments", {
      fields: ["payable_amount"],
      type: "check",
      name: "chk_payments_payable_amount_nonneg",
      where: { payable_amount: { [Sequelize.Op.gte]: 0 } },
    });
    await queryInterface.addConstraint("payments", {
      fields: ["payment_status"],
      type: "check",
      name: "chk_payments_status_enum",
      where: {
        payment_status: { [Sequelize.Op.in]: ["initiated", "success", "failed"] },
      },
    });
    await queryInterface.addConstraint("payments", {
      fields: ["payment_gateway"],
      type: "check",
      name: "chk_payments_gateway_enum",
      where: {
        payment_gateway: { [Sequelize.Op.in]: ["RAZORPAY"] },
      },
    });

    await queryInterface.addIndex("payments", {
      fields: ["seller_id"],
      name: "idx_payments_seller",
    });
    await queryInterface.addIndex("payments", {
      fields: ["user_id"],
      name: "idx_payments_user",
    });
    await queryInterface.addIndex("payments", {
      fields: ["order_id"],
      name: "idx_payments_order",
    });
    await queryInterface.addIndex("payments", {
      fields: ["payment_cycle_id"],
      name: "idx_payments_cycle",
    });
    await queryInterface.addIndex("payments", {
      fields: ["payment_status"],
      name: "idx_payments_status",
    });
    // idempotent on gateway retries once a partner transaction id is assigned
    await queryInterface.addIndex("payments", {
      fields: ["payment_gateway", "transaction_id"],
      unique: true,
      name: "uq_payments_gateway_transaction_id",
      where: { transaction_id: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("payments");
  },
};
