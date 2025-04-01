import { createClient } from "redis";

class RedisUtil {
  private redisClient = null;
  constructor() {
    this.redisClient = createClient({
      url: "redis://localhost:6379",
    });

    this.redisClient.on("connect", () => {
      console.log("=======Redis connected========");
    });

    this.redisClient.on("error", (_err) => {
      console.log("=======Redis Connection Error========");
    });
  }

  private redisWrapper = async (func: Function) => {
    try {
      return await func();
    } catch (_err) {
      return null;
    }
  };

  private getClient = async () => {
    return await this.redisWrapper(this.redisClient);
  };

  public getKey = async function (key: string) {
    return await this.redisWrapper(this.getClient().get(key));
  };

  public setKey = async (key: string, value: string | object) => {
    const client = await this.getClient();
    if (client) {
      return await this.redisWrapper(client.set(key, value));
    }
  };
}

export default RedisUtil;
