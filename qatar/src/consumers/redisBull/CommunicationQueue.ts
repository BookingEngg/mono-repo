// Modules
import { consumers, redisConfig } from "@/config";
// Consumers Handler
import RedisBull from "./RedisBull";
// Http
import BackendHttp from "@/http/backend.http";

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
    this.redisBull.enableBatchPublish(); // Enable batch publish

    // Initialize Backend Http
    this.backendHttp = new BackendHttp();
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = async (data: object[]) => {
    try {
      if (data?.length) {
        const payload = {
          data,
          type: data.length == 1 ? "single_message" : "batch_messages",
        };
        await this.backendHttp.createMessage(payload);
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
