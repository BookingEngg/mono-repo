// Modules
const { env } = require("../config");
const { PubSub } = require("@google-cloud/pubsub");

class PubSubTopic {
  subscription = null;
  messageHandler = null;
  onConsumerError = null;

  constructor(consumerConfig) {
    const {
      project_id: projectId,
      client_email: clientEmail,
      private_key: privateKey,
      subscription_name: subscriptionName,
    } = consumerConfig;

    const pubsub = new PubSub({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    this.subscription = pubsub.subscription(subscriptionName);
  }

  addListeners = (payload) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
  };

  onConsumerStart = () => {
    this.subscription.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.data);
        this.messageHandler(parsedMessage);
        message.ack(); // Mark message with ack as message processed
      } catch (err) {
        this.onConsumerError(err);
      }
    });
    this.subscription.on("error", this.onConsumerError);

    console.log(
      `TOPIC QUEUE START LISTENING... ENV: ${JSON.stringify({ env })}`
    );
  };
}

module.exports = PubSubTopic;
