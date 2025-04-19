// Modules
import { consumers, redisConfig } from "@/config";
// Consumers Handler
import RedisBull from "./RedisBull";
// Http
import BackendHttp from "@/http/backend.http";
// Types
import { ICommunicationQueueMessage } from "./redisbulll.interface";

class CommunicationQueue {
  private redisBull: RedisBull;
  private backendHttp: BackendHttp;

  constructor() {
    if (!consumers.communication_queue || !redisConfig) {
      throw new Error("Communication Queue Config Not Found");
    }

    this.redisBull = new RedisBull({
      queue: consumers.communication_queue.consumer_name,
      ...redisConfig,
    });
    this.redisBull.addListeners({
      messageHandler: this.messageHandler,
      onConsumerError: this.onConsumerError,
    });

    // Initialize Backend Http
    this.backendHttp = new BackendHttp();
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = async (data: ICommunicationQueueMessage) => {
    try {
      const { type } = data;

      switch (type) {
        case "new_message":
          console.log("NEW MESSAGE >>>>>>", data);
          await this.backendHttp.createMessage(data);
          return;
      }
    } catch (err) {
      this.onConsumerError(err);
    }
  };

  private onConsumerError = (error: any) => {
    console.log("Error IN Communication Queue>>>>>>>>", error);
  };

  /**
   * Start the communication consumer
   */
  public startConsumers() {
    this.redisBull.onConsumerStart();
  }
}

export default CommunicationQueue;
