import Redis from "ioredis";
import { getRedisUrl } from "@/util/utils.util";

class RedisUtil {
  private redisClient = null;
  private STREAM_NAME = "my_stream";    // Need to move this to config as well

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

  private getClient = async () => {
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

  // public test = async () => {
  //   const response = await (await this.getClient()).xadd(
  //     this.STREAM_NAME,
  //     "*",
  //     "content",
  //     "Hello world from dashboard"
  //   );
  // };
}

export default RedisUtil;
