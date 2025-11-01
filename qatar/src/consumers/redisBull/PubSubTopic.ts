// Modules
import { env } from "@/config";
import { PubSub, Subscription } from "@google-cloud/pubsub";

export interface Function<T> {
  (data: T): void;
}

class PubSubTopic {
  private subscription: Subscription;
  private messageHandler: Function<any>;
  private onConsumerError: Function<any>;

  constructor(consumerConfig: { subscription_name: string }) {
    const pubsub = new PubSub({
      
    });

    this.subscription = pubsub.subscription(consumerConfig.subscription_name);
  }

  addListeners = (payload: {
    messageHandler: Function<any>;
    onConsumerError: Function<any>;
  }) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
  };

  onConsumerStart = () => {
    this.subscription.on("message", (message) => {
      try {
        this.messageHandler(message);
        // message.ack(); // Mark message with ack as message processed
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

export default PubSubTopic;
