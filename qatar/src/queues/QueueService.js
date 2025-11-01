const PubSubTopic = require("./PubSubTopic");
const RedisBull = require("./RedisBull");

const QueueTypes = {
  PUBSUB: "topic",
  BULL: "bull",
};

class QueueService {
  _queue = null;

  constructor(config) {
    if (config.queue_type === QueueTypes.PUBSUB) {
      this._queue = new PubSubTopic(config);
    } else if (config.queue_type === QueueTypes.BULL) {
      this._queue = new RedisBull(config);
    }
  }

  addListeners = (payload) => {
    this._queue.addListeners(payload);
  };

  onConsumerStart = () => {
    this._queue.onConsumerStart();
  };
}

module.exports = QueueService;
