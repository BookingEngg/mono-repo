import Redis from "ioredis";
import { redisConfig } from "../config";
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
  }

  public addListeners = (payload: IAddListenerPayload) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
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
            if (this.messageHandler) {
              this.messageHandler(fields);
            }
          });
        }
      );
    } else {
      console.log("No new messages");
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

  // private createConsumerGroup = async () => {
  //   //  '$' tells Redis to start reading from new messages
  //   //  'MKSTREAM' creates the stream if it doesn't exist
  //   return this.redisClient.xgroup(
  //     "CREATE",
  //     this.stream,
  //     this.group,
  //     "$",
  //     "MKSTREAM"
  //   );
  // };
}

export default RedisStream;
