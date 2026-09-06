"use strict";

/**
 * `online_response` becomes a real Postgres array (`jsonb[]`) instead of a
 * jsonb value that happens to hold an array.
 *
 * The point is the append: `array_append(online_response, ...)` is a plain,
 * greppable function call, where appending to a jsonb value needs a `||` with
 * a CASE around it to cope with non-array values. Same atomicity, far less to
 * read when a payment's history is being debugged.
 *
 * Done as add-populate-swap rather than ALTER ... USING, because unnesting a
 * jsonb array needs a subquery and Postgres rejects those in a transform
 * expression.
 */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.query(
      `ALTER TABLE payments ADD COLUMN online_response_array jsonb[];`,
    );

    // Existing rows already hold jsonb arrays (see the previous migration);
    // unnest them into real array elements.
    await sequelize.query(`
      UPDATE payments
      SET online_response_array = ARRAY(
        SELECT jsonb_array_elements(online_response)
      )
      WHERE online_response IS NOT NULL
        AND jsonb_typeof(online_response) = 'array';
    `);

    // Defensive: anything not an array becomes a single-element one.
    await sequelize.query(`
      UPDATE payments
      SET online_response_array = ARRAY[online_response]
      WHERE online_response IS NOT NULL
        AND jsonb_typeof(online_response) <> 'array';
    `);

    await sequelize.query(`ALTER TABLE payments DROP COLUMN online_response;`);
    await sequelize.query(
      `ALTER TABLE payments RENAME COLUMN online_response_array TO online_response;`,
    );
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    await sequelize.query(
      `ALTER TABLE payments ADD COLUMN online_response_jsonb jsonb;`,
    );
    await sequelize.query(`
      UPDATE payments
      SET online_response_jsonb = to_jsonb(online_response)
      WHERE online_response IS NOT NULL;
    `);
    await sequelize.query(`ALTER TABLE payments DROP COLUMN online_response;`);
    await sequelize.query(
      `ALTER TABLE payments RENAME COLUMN online_response_jsonb TO online_response;`,
    );
  },
};
