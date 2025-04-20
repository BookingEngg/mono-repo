// Modules
import Queue from "bull";
import moment from "moment";
// Types
import {
  IAddListenerPayload,
  IRedisBullConsumerConfig,
} from "@/consumers/types";

const BATCH_SIZE = 3; // Need to move to config
const BATCH_SESSION_TIME_MINUTES = 100; // Need to move to config
const BATCH_PUBLISH_INTERVAL = 1000; // Need to move to config

class RedisBull {
  private queue: Queue.Queue;
  private messageHandler: (message: any) => void;
  private onConsumerError: (error: any) => void;

  // Batch Related Fields
  private isEnabledBatchPublish: boolean = false;
  private lastBatchPublishTime: Date | null = null;
  private currentBatchSize: number = 0;
  private batchData: any[] = [];

  constructor(consumerConfig: IRedisBullConsumerConfig) {
    this.queue = new Queue(consumerConfig.queue, {
      redis: consumerConfig,
    });
  }

  public addListeners = (payload: IAddListenerPayload) => {
    this.messageHandler = payload.messageHandler;
    this.onConsumerError = payload.onConsumerError;
  };

  public enableBatchPublish = () => {
    this.isEnabledBatchPublish = true;
  };

  public onConsumerStart = () => {
    if (this.isEnabledBatchPublish) {
      this.publishBatchData();
    }

    this.queue.process(async (job, done) => {
      try {
        this.currentBatchSize += 1; // Receive an event
        this.lastBatchPublishTime = new Date(); // Update the last publish time

        /**
         * Check if the queue configured for batch publish
         * In case of batch publish, push the event to local array otherwise call the message handler
         */
        if (this.isEnabledBatchPublish) {
          this.batchData.push(job.data); // push the event to local
        } else {
          if (this.messageHandler) {
            this.messageHandler([job.data]); // call the message handler
          }
        }
      } catch (err) {
        if (this.onConsumerError) {
          this.onConsumerError(err);
        }
      }

      done();
    });
    console.log("QUEUE START LISTENING...");
  };

  /**
   * Publish the batch data to the queue
   */
  private publishBatchData = async () => {
    setInterval(() => {
      const isBatchSessionTimeOut =
        this.lastBatchPublishTime &&
        moment(this.lastBatchPublishTime).diff(moment(), "minutes") >
          BATCH_SESSION_TIME_MINUTES;
      if (
        (this.currentBatchSize >= BATCH_SIZE || isBatchSessionTimeOut) &&
        this.messageHandler
      ) {
        // Publish the batch data to the queue and reset the batch related fields
        this.messageHandler(this.batchData);
        this.batchData = [];
        this.currentBatchSize = 0;
        this.lastBatchPublishTime = null;
      }
    }, BATCH_PUBLISH_INTERVAL);
  };
}

export default RedisBull;
