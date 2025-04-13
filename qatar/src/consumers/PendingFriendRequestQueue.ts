import RedisStream from "./RedisStream";
import { consumers } from "@/config";
const { pending_friend_req_queue } = consumers;

class PendingFreiendRequestQueue {
  private redisStream: RedisStream | null = null;

  constructor() {
    this.redisStream = new RedisStream({ ...pending_friend_req_queue });
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
