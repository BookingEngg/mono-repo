import RedisStream from "./RedisStream";

class Consumers {
  private redisStream: RedisStream | null = null;

  constructor() {
    this.redisStream = new RedisStream();

    this.startConsumers(); // Starts all the consumers
  }

  /**
   * Starts all the consumers
   */
  private startConsumers() {
    this.redisStream.onConsumerStart();
  }
}

export default Consumers;
