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

  public initializeSocketEvents(payload: ISocketEvent) {
    const { eventName, socket, io } = payload;
    this.io = io;

    switch (eventName) {
      case "init":
        return async (payload: string) => {
          const parsedPayload = JSON.parse(payload);
          const { user_id } = parsedPayload;

          if (user_id) {
            const roomId = `room-${user_id}`;
            socket.join(roomId);
            socket.data.userId = user_id;
          }
        };
      case "new-chat-message":
        return this.addNewChatMessage;
      case "disconnect": 
        // Trigger if client refresh a tab several time then you can see it in action
        return () => {
          console.log("SOCKET ROOMS>>>> ", socket.rooms);
        };
      default:
        return () => {};
    }
  }

  private addNewChatMessage = async (payload: string) => {
    const parsedPayload = JSON.parse(payload);
    const { sender_id, sender_name, receiver_id, message } = parsedPayload;

    if (sender_id && receiver_id && message) {
      const eventPayload = {
        ...parsedPayload,
        type: "new_message",
      };
      this.communicationPublisher.raiseEventForSendMessage(eventPayload);
      const roomId = `room-${receiver_id}`;

      // Send back the message to receiver client room
      this.io.to(roomId).emit("received-user-chat", {
        user_id: sender_id,
        name: sender_name,
        message,
        created_at: moment.utc().utcOffset("+05:30").format("hh:mm a"),
      });
    }
  };
}

export default SocketEvents;
