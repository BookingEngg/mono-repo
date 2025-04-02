import Redis from "ioredis";

class RedisStream {
  private redisConsumer: Redis | null = null;
  private STREAM_NAME = "my_stream";

  constructor() {
    this.redisConsumer = new Redis({
      host: "localhost",
      port: 6379,
    });
    this.onConsumerStart();
  }

  private onConsumerStart = async () => {
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
