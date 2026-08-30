"use strict";

/**
 * Folds the Mongo `conversions` collection into `earnings`.
 *
 * A conversion is only ever recorded for the job's paying trigger, so the two
 * were 1:1 — one row per paid event, carrying both what happened and what it
 * is worth. Keeping them apart meant the accrual write could never be atomic
 * with the payments/wallets it settles against, since those live here in
 * Postgres and conversions lived in Mongo.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("earnings", "job_application_short_id", {
      type: Sequelize.STRING,
    });
    // Identifier the brand reports back, used to dedupe retries.
    await queryInterface.addColumn("earnings", "visitor_id", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("earnings", "trigger", {
      type: Sequelize.STRING,
    });
    // BRAND (their webhook) vs INHOUSE (inferred by our own tracking).
    await queryInterface.addColumn("earnings", "event_source", {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn("earnings", "awb_no", {
      type: Sequelize.STRING,
    });
    // When the event actually happened, as opposed to when we wrote the row.
    await queryInterface.addColumn("earnings", "recorded_at", {
      type: Sequelize.DATE,
    });

    // A click-based accrual (CPC / LINK_CLICK) has no order yet — the brand
    // only reports an order id once one exists. order_id was NOT NULL from
    // when this table only modelled order-shaped earnings.
    await queryInterface.changeColumn("earnings", "order_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addIndex("earnings", {
      fields: ["job_application_short_id"],
      name: "idx_earnings_job_application",
    });

    /**
     * The dedupe guarantee carried over from the Mongo collection: one
     * visitor can only register the same trigger once per application.
     *
     * This is what makes accrual idempotent — brand webhooks retry, and
     * without it a retry would pay the same conversion twice. Enforced here
     * rather than in application code because a retry can race itself.
     *
     * Partial, because a reversal row has no visitor_id and must not collide
     * with the accrual it reverses.
     */
    await queryInterface.addIndex("earnings", {
      fields: ["job_application_short_id", "visitor_id", "trigger"],
      unique: true,
      name: "uq_earnings_application_visitor_trigger",
      where: { visitor_id: { [Sequelize.Op.ne]: null } },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "earnings",
      "uq_earnings_application_visitor_trigger",
    );
    await queryInterface.removeIndex("earnings", "idx_earnings_job_application");

    await queryInterface.changeColumn("earnings", "order_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    for (const column of [
      "job_application_short_id",
      "visitor_id",
      "trigger",
      "event_source",
      "awb_no",
      "recorded_at",
    ]) {
      await queryInterface.removeColumn("earnings", column);
    }
  },
};
