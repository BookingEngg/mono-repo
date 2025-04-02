import RedisStream from "./RedisStream";

class Consumers {
  private redisStream: RedisStream | null = null;

  constructor() {
    this.redisStream = new RedisStream();
  }
}

export default Consumers;
