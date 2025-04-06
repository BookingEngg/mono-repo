import CommunicationQueue from "./CommunicationQueue";

class Consumers {
  // Declare all consumers queue
  private communicationQueue: CommunicationQueue;

  constructor() {
    // Init all the consumers
    this.communicationQueue = new CommunicationQueue();
  }

  public startConsumers = () => {
    // Run all the consumers
    this.communicationQueue.startConsumers();
  };
}

export default Consumers;
