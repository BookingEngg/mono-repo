// Modules
import { consumers, gcpConfig } from "@/config";
// Consumers Handler
import PubSubTopic from "@/consumers/redisBull/PubSubTopic";
import RedisBull from "@/consumers/redisBull/RedisBull";
// Http
import BackendHttp from "@/http/backend.http";
import { ICommunicationQueueMessage } from "./redisbulll.interface";

class CommunicationTopicQueue {
  private backendHttp: BackendHttp;
  private pubsubTopic: PubSubTopic;

  constructor() {
    this.pubsubTopic = new PubSubTopic({
      ...gcpConfig,
      ...consumers.communication_queue,
    });

    this.pubsubTopic.addListeners({
      messageHandler: this.messageHandler,
      onConsumerError: this.onConsumerError,
    });

    // Initialize Backend Http
    this.backendHttp = new BackendHttp();
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = async (data: { data: string }) => {
    try {
      const parsedData = JSON.parse(data.data) as ICommunicationQueueMessage;
      const { type, ...rest } = parsedData;

      switch (type) {
        case "new_message":
          console.log("NEW MESSAGE >>>>>>", rest);
          // await this.backendHttp.createMessage(data);
          return;
      }
    } catch (err) {
      this.onConsumerError(err);
    }
  };

  private onConsumerError = (error: any) => {
    console.log("Error in Topic Communication Queue>>>>>>>>", error);
  };

  /**
   * Start the communication consumer
   */
  public startConsumers() {
    this.pubsubTopic.onConsumerStart();
  }
}

export default CommunicationTopicQueue;
