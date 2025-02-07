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
      // case "new-chat-message":
      //   return (data: string) => {
      //     // broadcase the event message to all the client data
      //     io.emit("message", JSON.parse(data));
      //   };
      case "new-chat-message":
        return this.addNewChatMessage;
      default:
        return () => {};
    }
  }

  private addNewChatMessage = async (payload: string) => {
    const parsedPayload = JSON.parse(payload);
    const { sender_id, user_id, message } = parsedPayload;

    if (sender_id && user_id && message) {
      await this.communicationService.createChat({
        senderId: sender_id,
        receiverId: user_id,
        message,
      });

      this.io.emit("refetch-user-chat", "");
    }
  };
}

export default SocketEvents;
