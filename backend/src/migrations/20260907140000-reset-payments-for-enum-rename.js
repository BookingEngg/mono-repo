"use strict";

/**
 * Wipes the payments table.
 *
 * Two enum values changed shape and every existing row carries the old ones:
 * `payment_gateway` was "RAZORPAY" and is now "razorpay", and payment type
 * "online" is now "settlement". These are development rows against Razorpay
 * test keys, so they are deleted rather than backfilled — as requested.
 *
 * DELETE rather than TRUNCATE: earnings has a foreign key onto payments, and
 * Postgres refuses to truncate a referenced table even with no referencing
 * rows. TRUNCATE ... CASCADE would clear earnings too, which is not what was
 * asked for. The sequence is restarted separately so ids begin at 1 again.
 *
 * earnings.payment_id references payments(id). Those references are cleared
 * first and the earnings themselves returned to `accrued` — a settled earning
 * whose payment no longer exists would otherwise be marked paid against
 * nothing, and would never be picked up by a future settlement.
 */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.query(`
      UPDATE earnings
      SET payment_id = NULL,
          earning_status = 'accrued'
      WHERE payment_id IS NOT NULL;
    `);

    await sequelize.query(`DELETE FROM payments;`);
    await sequelize.query(`ALTER SEQUENCE payments_id_seq RESTART WITH 1;`);
  },

  /**
   * Irreversible: the rows are gone and were not copied anywhere. Left as a
   * no-op rather than throwing, so rolling back the batch is not blocked by a
   * migration that only ever deleted development data.
   */
  async down() {
    // Nothing to restore.
  },
};
