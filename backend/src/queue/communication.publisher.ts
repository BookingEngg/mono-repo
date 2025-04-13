import RedisQueueService from "@/services/redisQueueService";
import * as config from "@/config";

class CommunicationPublisher {
  private queue: RedisQueueService;

  constructor() {
    if (!config.publishers.communication_queue) {
      throw new Error("Queue Config Not Found");
    }

    this.queue = new RedisQueueService(config.publishers.communication_queue);
  }

  public raiseEventForSendMessage = (payload: object) =>
    this.queue.publishMessage(payload);
}

export default CommunicationPublisher;
