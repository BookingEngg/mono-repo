// Modules
import moment from "moment";
import { Server, Socket } from "socket.io";
// Publisher
import CommunicationPublisher from "@/queue/communication.publisher";

export interface ISocketEvent {
  eventName: string;
  io: Server;
  socket: Socket;
}

class SocketEvents {
  private io: Server;
  private communicationPublisher = new CommunicationPublisher();
  private usersSocketHash = new Map();

  public initializeSocketEvents(payload: ISocketEvent) {
    const { eventName, socket, io } = payload;
    this.io = io;

    switch (eventName) {
      case "init":
        return async (payload: string) => {
          const parsedPayload = JSON.parse(payload);
          const { user_id } = parsedPayload;

          if (user_id) {
            this.usersSocketHash.set(user_id, socket.id);
          }
        };
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
      const eventPayload = {
        ...parsedPayload,
        type: "new_message",
        message_created_at: moment.utc().toDate(),  // Message created time
      };
      this.communicationPublisher.raiseEventForSendMessage(eventPayload);

      const receiverSocketId = this.usersSocketHash.get(receiver_id);
      this.io.to(receiverSocketId).emit("received-user-chat", {
        user_id: sender_id,
        message,
        created_at: moment.utc().format("hh:mm a"),
      });
    }
  };
}

export default SocketEvents;
