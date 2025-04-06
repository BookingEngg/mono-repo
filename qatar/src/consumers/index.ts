import CommunicationQueue from "./CommunicationQueue";
import PendingFreiendRequestQueue from "./PendingFriendRequestQueue";

class Consumers {
  // Declare all consumers queue
  private communicationQueue: CommunicationQueue;
  private pendingFriendRequestQueue: PendingFreiendRequestQueue;

  constructor() {
    // Init all the consumers
    this.communicationQueue = new CommunicationQueue();
    this.pendingFriendRequestQueue = new PendingFreiendRequestQueue();
  }

  public startConsumers = () => {
    // Run all the consumers
    this.communicationQueue.startConsumers();
    this.pendingFriendRequestQueue.startConsumers();
  };
}

export default Consumers;
