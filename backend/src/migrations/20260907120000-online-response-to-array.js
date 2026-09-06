"use strict";

/**
 * `online_response` now holds an array — one entry per exchange with the
 * gateway (the order response, then each verify poll and webhook) rather than
 * only the most recent one.
 *
 * Existing rows hold a bare object, which `||` cannot append to, so they are
 * wrapped into single-element arrays. The column type is unchanged: it was
 * already jsonb, which holds either shape.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE payments
      SET online_response = jsonb_build_array(online_response)
      WHERE online_response IS NOT NULL
        AND jsonb_typeof(online_response) <> 'array';
    `);
  },

  /**
   * Unwraps back to the last entry — the only one the previous code kept.
   * Earlier entries in a multi-entry array are dropped, because the old shape
   * has nowhere to put them.
   */
  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE payments
      SET online_response = online_response -> (jsonb_array_length(online_response) - 1)
      WHERE online_response IS NOT NULL
        AND jsonb_typeof(online_response) = 'array'
        AND jsonb_array_length(online_response) > 0;
    `);
  },
};
