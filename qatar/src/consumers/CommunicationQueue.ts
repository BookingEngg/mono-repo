import RedisStream from "./RedisStream";
import { consumers } from "@/config";
const { communication_queue } = consumers;

class CommunicationQueue {
  private redisStream: RedisStream | null = null;

  constructor() {
    this.redisStream = new RedisStream({...communication_queue});
    this.redisStream.addListeners({ messageHandler: this.messageHandler });
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = (data: string[]) => {
    console.log("Data in communication queue msg handler>>>", data);
  };

  /**
   * Start the communication consumer
   */
  public startConsumers() {
    this.redisStream.onConsumerStart();
  }
}

export default CommunicationQueue;
