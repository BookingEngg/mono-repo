"use strict";

/**
 * Denormalizes the job reference onto `earnings`.
 *
 * An earning already carries job_application_short_id, but the application →
 * job mapping lives in Mongo. Without this column, "settled vs pending per
 * job" would mean pulling every earning row for a brand into memory and
 * resolving each one cross-database. With it, the whole report is a single
 * GROUP BY that stays flat as a brand's volume grows.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("earnings", "job_short_id", {
      type: Sequelize.STRING,
    });

    // The job-level settlement report groups on (seller_id, job_short_id);
    // seller_id leads because every query is already scoped to one brand.
    await queryInterface.addIndex("earnings", {
      fields: ["seller_id", "job_short_id"],
      name: "idx_earnings_seller_job",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("earnings", "idx_earnings_seller_job");
    await queryInterface.removeColumn("earnings", "job_short_id");
  },
};
