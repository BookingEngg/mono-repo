import RedisStream from "./RedisStream";
import { consumers } from "@/config";
const { config, communication_queue } = consumers;

// Prepare config for the communication consumer queue
const communicationConfig = {
  stream: config.stream,
  consumer_name: communication_queue.consumer_name,
  consumer_group: communication_queue.consumer_group,
};

class CommunicationQueue {
  private redisStream: RedisStream | null = null;

  constructor() {
    this.redisStream = new RedisStream(communicationConfig);
    this.redisStream.addListeners({ messageHandler: this.messageHandler });
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = (data: string[]) => {
    console.log("DATA IN MESSAGE HNANDLER>>>", data);
  };

  /**
   * Start the communication consumer
   */
  public startConsumers() {
    this.redisStream.onConsumerStart();
  }
}

export default CommunicationQueue;
