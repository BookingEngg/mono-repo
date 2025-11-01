const { subscribe } = require("diagnostics_channel");

module.exports = {
  apps: [
    {
      name: "communication-queue",
      script: "./src/subscribers/communication/index.js",
    },
    {
      name: "communication-queue-topic",
      script: "./src/subscribers/communication/topic_queue.js",
    },
  ].map((subscriber) => {
    return {
      ...subscriber,
      // Run with: pm2 start ecosystem.config.js --env production
      env_production: {
        NODE_ENV: "prod",
      },

      // Run with: pm2 start ecosystem.config.js --env development
      env_development: {
        NODE_ENV: "development",
      },
    };
  }),
};
