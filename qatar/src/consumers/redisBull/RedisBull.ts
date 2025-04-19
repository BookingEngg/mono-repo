// Modules
import Queue from "bull";
// Types
import {
  IAddListenerPayload,
  IRedisBullConsumerConfig,
} from "@/consumers/types";

class RedisBull {
  private queue: Queue.Queue;
  private messageHandler: (message: any) => void;
  private onConsumerError: (error: any) => void;

  constructor(consumerConfig: IRedisBullConsumerConfig) {
    this.queue = new Queue(consumerConfig.queue, {
      redis: consumerConfig,
    });
  }

  public addListeners = (payload: IAddListenerPayload) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
  };

  public onConsumerStart = () => {
    this.queue.process(async (job, done) => {
      if (this.messageHandler) {
        try {
          this.messageHandler(job.data);
        } catch (err) {
          if (this.onConsumerError) {
            this.onConsumerError(err);
          }
        }
      }
      done();
    });
    console.log("QUEUE START LISTENING...");
  };
}

export default RedisBull;
