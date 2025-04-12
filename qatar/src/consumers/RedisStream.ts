import Redis from "ioredis";
import { isProduction, redisConfig } from "../config";
import { getRedisClientConnectionUrl } from "@/util/util";
import { IAddListenerPayload, IRedisConsumerConfig } from "./types";

class RedisStream {
  private redisClient: Redis;
  private stream: string;
  private group: string;
  private consumer_name: string;
  private messageHandler: (message: any) => void;
  private onConsumerError: (error: any) => void;

  constructor(consumerConfig: IRedisConsumerConfig) {
    this.redisClient = new Redis(getRedisClientConnectionUrl(redisConfig));

    this.stream = consumerConfig.stream;
    this.group = consumerConfig.consumer_group;
    this.consumer_name = consumerConfig.consumer_name;

    this.validateStreamGroup();
  }

  public addListeners = (payload: IAddListenerPayload) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
  };

  private validateStreamGroup = async () => {
    try {
      await this.redisClient.xgroup(
        "CREATE",
        this.stream,
        this.group,
        "$",
        "MKSTREAM"
      );
    } catch (err) {
      if (err.message.includes("BUSYGROUP")) {
        console.log("Group already exists");
      } else if (this.onConsumerError) {
        this.onConsumerError(err);
      }
    }
  };

  /**
   * Read new messages from the stream as part of the group
   */
  private readFromStreamGroup = async () => {
    const messages = await this.redisClient.xreadgroup(
      "GROUP",
      this.group,
      this.consumer_name,
      "COUNT",
      10,
      "BLOCK",
      2000,
      "STREAMS",
      this.stream,
      ">"
    );

    if (messages) {
      messages.forEach(
        ([_, entries]: [
          _: string,
          entries: [_id: string, fields: string[]][],
        ]) => {
          entries.forEach(([_id, fields]) => {
            if (!isProduction) console.log("Message received >>>>> ", fields);
            if (this.messageHandler) {
              this.messageHandler(fields);
            }
          });
        }
      );
    }
  };

  public onConsumerStart = async () => {
    if (this.redisClient == null) {
      return;
    }

    // Contineously read from the stream
    while (true) {
      try {
        await this.readFromStreamGroup();
      } catch (err) {
        if (this.onConsumerError) {
          this.onConsumerError(err);
        }
        await new Promise((r) => setTimeout(r, 1000)); // small backoff on error
      }
    }
  };
}

export default RedisStream;
