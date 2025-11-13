import RedisQueueService from "@/services/redis.service";
import * as config from "@/config";

class CommunicationPublisher {
  private queue: RedisQueueService;

  constructor() {
    const { publishers, redisConfig } = config;

    if (!publishers.communication_queue || !redisConfig) {
      throw new Error("Queue Config Not Found");
    }

    this.queue = new RedisQueueService({
      ...redisConfig,
      ...publishers.communication_queue,
    });
  }

  public raiseEventForSendMessage = (payload: object) =>
    this.queue.publishMessageToBull(payload);
}

export default CommunicationPublisher;
