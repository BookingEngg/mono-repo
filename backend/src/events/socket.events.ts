import CommunicationService from "@/services/communication.service";
import { Server, Socket } from "socket.io";
import moment from "moment";

export interface ISocketEvent {
  eventName: string;
  io: Server;
  socket: Socket;
}

class SocketEvents {
  private io: Server;
  private communicationService = new CommunicationService();
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
      await this.communicationService.createChat({
        senderId: sender_id,
        receiverId: receiver_id,
        message,
      });

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
