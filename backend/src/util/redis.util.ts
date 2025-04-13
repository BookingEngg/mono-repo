import Redis from "ioredis";
import { getRedisUrl } from "@/util/utils.util";

class RedisUtil {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis(getRedisUrl());

    this.redisClient.on("connect", () => {
      console.log("=======Redis connected========");
    });

    this.redisClient.on("error", (_err) => {
      console.log("=======Redis Connection Error========");
    });
  }

  private redisWrapper = async (func: Function): Promise<Redis | null> => {
    try {
      return await func();
    } catch (_err) {
      return null;
    }
  };

  protected getClient = async () => {
    return await this.redisWrapper(() => this.redisClient);
  };

  public getKey = async function (key: string) {
    return await this.redisWrapper(this.getClient().get(key));
  };

  public setKey = async (key: string, value: string | object) => {
    const client = await this.getClient();
    if (client) {
      if (value instanceof Object) {
        value = JSON.stringify(value);
      }
      return await client.set(key, value);
    }
  };
}

export default RedisUtil;
