import RedisUtil from "@/util/redis.util";
import { IRedisQueueConfig } from "@/interfaces/queue.interface";

class RedisQueueService extends RedisUtil {
  private queueConfig: IRedisQueueConfig;

  constructor(queueConfig: IRedisQueueConfig) {
    super();
    this.queueConfig = queueConfig;
  }

  public publishMessage = async (message: object) => {
    const client = await this.getClient();
    const { stream } = this.queueConfig;

    if (!client || !stream) {
      return;
    }

    return await client.xadd(stream, "*", "message", JSON.stringify(message));
  };
}

export default RedisQueueService;
