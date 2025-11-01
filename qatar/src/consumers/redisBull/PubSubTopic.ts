// Modules
import { env } from "@/config";
import { PubSub, Subscription } from "@google-cloud/pubsub";

export interface Function<T> {
  (data: T): void;
}

export interface IPubSubTopicInitConfig {
  project_id: string;
  client_email: string;
  private_key: string;
  subscription_name: string;
}

class PubSubTopic {
  private subscription: Subscription;
  private messageHandler: Function<any>;
  private onConsumerError: Function<any>;

  constructor(consumerConfig: Partial<IPubSubTopicInitConfig>) {
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
