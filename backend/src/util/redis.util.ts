import { createClient } from "redis";

class RedisUtil {
  private redisClient = null;
  constructor() {
    try {
      this.redisClient = createClient({
        url: "redis://localhost:6379",
      });
      this.redisClient.connect();
      console.log("=======Redis connected========");
    } catch (_err) {
      console.log("====Redis connection error====");
    }
  }

  private getClient() {
    return this.redisClient;
  }

  public getKey(key: string) {
    return this.getClient().get(key);
  }

  public setKey(key: string, value: string | object) {
    if (typeof value === "object") {
      value = JSON.stringify(value);
    }
    return this.getClient().set(key, value);
  }
}

export default RedisUtil;
