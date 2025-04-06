import RedisStream from "./RedisStream";
import { consumers } from "@/config";
const { config, communication_queue } = consumers;

// Prepare config for the communication consumer queue
const pendingFriendReqConfig = {
  stream: "my_stream2",
  consumer_name: communication_queue.consumer_name,
  consumer_group: communication_queue.consumer_group,
};

class PendingFreiendRequestQueue {
  private redisStream: RedisStream | null = null;

  constructor() {
    this.redisStream = new RedisStream(pendingFriendReqConfig);
    this.redisStream.addListeners({ messageHandler: this.messageHandler });
  }

  /**
   * All the message listen to the communication queue will come this place
   */
  private messageHandler = (data: string[]) => {
    console.log("Data in pending freiend req msg handler>>>", data);
  };

  /**
   * Start the communication consumer
   */
  public startConsumers() {
    this.redisStream.onConsumerStart();
  }
}

export default PendingFreiendRequestQueue;
