// Modules
import Queue from "bull";
// Util
import RedisUtil from "@/util/redis.util";
// Interfaces
import { IRedisQueueConfig } from "@/interfaces/queue.interface";

class RedisQueueService extends RedisUtil {
  private queueConfig: IRedisQueueConfig;
  private queue: Queue.Queue;

  constructor(queueConfig?: IRedisQueueConfig) {
    super();

    this.queueConfig = queueConfig;
    this.queue = new Queue(this.queueConfig.queue, {
      redis: this.queueConfig,
    });
  }

  /**
   * Publish message to redis stream
   */
  public publishMessageToStream = async (message: object) => {
    const client = await this.getClient();
    const { stream } = this.queueConfig;

    if (!client || !stream) {
      return;
    }

    return await client.xadd(stream, "*", "message", JSON.stringify(message));
  };

  /**
   * Publish message to bull queue
   */
  public publishMessageToBull = async (message: object) => {
    this.queue.add(message);
  };
}

export default RedisQueueService;
