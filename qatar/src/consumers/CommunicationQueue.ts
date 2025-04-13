import BackendHttp from "@/http/backend.http";
import RedisStream from "./RedisStream";
import { consumers } from "@/config";
const { communication_queue } = consumers;

class CommunicationQueue {
  private redisStream: RedisStream;
  private backendHttp: BackendHttp;

  constructor() {
    this.redisStream = new RedisStream({ ...communication_queue });
    this.redisStream.addListeners({
      messageHandler: this.messageHandler,
      onConsumerError: this.onConsumerError,
    });

    // Initialize Backend Http
    this.backendHttp = new BackendHttp();
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = async (data: string[]) => {
    try {
      const [_, datum] = data;
      const parsedPayload = JSON.parse(datum);
      // const parsedPayload = JSON.parse("hello");

      const { type } = parsedPayload;

      switch (type) {
        case "new_message":
          await this.backendHttp.createMessage(parsedPayload);
          return;
      }
    } catch (err) {
      console.log("Error>>>>", err);
    }
  };

  private onConsumerError = (error: any) => {
    console.log("ERROR LOGS>>>>>>>>", error);
  };

  /**
   * Start the communication consumer
   */
  public startConsumers() {
    this.redisStream.onConsumerStart();
  }
}

export default CommunicationQueue;
