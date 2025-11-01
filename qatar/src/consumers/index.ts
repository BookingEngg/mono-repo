import CommunicationQueue from "@/consumers/redisBull/CommunicationQueue";
import CommunicationTopicQueue from "./redisBull/CommunicationTopicQueue";

class Consumers {
  // Declare all consumers queue
  private communicationQueue: CommunicationQueue;
  private communicationTopicQueue: CommunicationTopicQueue;

  constructor() {
    // Init all the consumers
    // this.communicationQueue = new CommunicationQueue();
    this.communicationTopicQueue = new CommunicationTopicQueue();
  }

  public startConsumers = () => {
    // Run all the consumers
    // this.communicationQueue.startConsumers();
    this.communicationTopicQueue.startConsumers();
  };
}

export default Consumers;
