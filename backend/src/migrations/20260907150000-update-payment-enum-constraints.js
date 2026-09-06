"use strict";

/**
 * Realigns the payments CHECK constraints with the renamed enum values:
 * `payment_gateway` "RAZORPAY" -> "razorpay", and payment type "online" ->
 * "settlement".
 *
 * These constraints are the database's own copy of the enums, so renaming the
 * TypeScript values alone is not enough — an insert with the new value is
 * rejected until the constraints move too.
 *
 * Safe to run without touching data: the previous migration emptied the table.
 */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.query(`
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_gateway_enum;
      ALTER TABLE payments ADD CONSTRAINT chk_payments_gateway_enum
        CHECK (payment_gateway::text = 'razorpay');
    `);

    await sequelize.query(`
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type_enum;
      ALTER TABLE payments ADD CONSTRAINT chk_payments_type_enum
        CHECK (payment_type::text = ANY (ARRAY['security_deposit', 'settlement']));
    `);
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.query(`
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_gateway_enum;
      ALTER TABLE payments ADD CONSTRAINT chk_payments_gateway_enum
        CHECK (payment_gateway::text = 'RAZORPAY');
    `);

    await sequelize.query(`
      ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payments_type_enum;
      ALTER TABLE payments ADD CONSTRAINT chk_payments_type_enum
        CHECK (payment_type::text = ANY (ARRAY['security_deposit', 'online']));
    `);
  },
};
