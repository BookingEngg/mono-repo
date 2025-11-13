// Modules
const { env, process_env } = require("../config");
const Queue = require("bull");

class RedisBull {
  queue = null;
  messageHandler = null;
  onConsumerError = null;

  constructor(consumerConfig) {
    this.queue = new Queue(consumerConfig.consumer_name, {
      redis: consumerConfig,
    });
  }

  addListeners = (payload) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
  };

  onConsumerStart = () => {
    this.queue.process(async (job, done) => {
      if (this.messageHandler) {
        try {
          this.messageHandler(job.data);
        } catch (err) {
          if (this.onConsumerError) {
            this.onConsumerError(err);
          }
        }
      }
      done();
    });
    console.log(`BULL QUEUE START LISTENING... ENV: ${JSON.stringify({ env })}`);
  };
}

module.exports = RedisBull;
