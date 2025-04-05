import Redis from "ioredis";
import { isProduction, redisConfig } from "../config";
import { IRedisConfig } from "../typings/config";

class RedisStream {
  private redisConsumer: Redis | null = null;
  private STREAM_NAME = "my_stream";

  constructor() {
    this.redisConsumer = new Redis(
      this.getRedisConsumerConnectionUrl(redisConfig)
    );
  }

  private getRedisConsumerConnectionUrl = (config: IRedisConfig) => {
    const { username, password, host, port } = config;
    const connectionUrl = [
      "redis://",
      `${isProduction ? username + ":" : ""}`,
      `${isProduction ? password + "@" : ""}`,
      `${host}:${port}`,
    ].join("");
    return connectionUrl;
  };

  public onConsumerStart = async () => {
    if (this.redisConsumer == null) {
      return;
    }

    let lastId = "0"; // Start reading from the beginning

    console.log("Consumer started, waiting for messages...");

    while (true) {
      try {
        const result = await this.redisConsumer.xread(
          "BLOCK",
          5000,
          "STREAMS",
          this.STREAM_NAME,
          lastId
        );

        if (result) {
          const [stream, messages] = result[0];

          for (const [id, fields] of messages) {
            console.log(`Received message: ${fields[1]}`);
            lastId = id;
          }
        }
      } catch (error) {
        console.error("Error consuming stream:", error);
      }
    }
  };
}

export default RedisStream;
