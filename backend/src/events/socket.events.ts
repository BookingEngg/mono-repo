import CommunicationService from "@/services/communication.service";

export interface ISocketEvent {
  eventName: string;
  io: any;
  socket: any;
}

class SocketEvents {
  private io;
  private communicationService = new CommunicationService();

  public initializeSocketEvents(payload: ISocketEvent) {
    const { eventName, io } = payload;
    this.io = io;

    switch (eventName) {
      case "new-chat-message":
        return this.addNewChatMessage;
      default:
        return () => {};
    }
  }

  private addNewChatMessage = async (payload: string) => {
    const parsedPayload = JSON.parse(payload);
    const { sender_id, receiver_id, message } = parsedPayload;

    if (sender_id && receiver_id && message) {
      await this.communicationService.createChat({
        senderId: sender_id,
        receiverId: receiver_id,
        message,
      });

      this.io.emit("refetch-user-chat", "");
    }
  };
}

export default SocketEvents;
