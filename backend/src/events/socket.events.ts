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
  private socket: Socket;
  private communicationPublisher = new CommunicationPublisher();

  public initializeSocketEvents(payload: ISocketEvent) {
    const { eventName, socket, io } = payload;
    this.io = io;
    this.socket = socket;

    switch (eventName) {
      case "init":
        return this.initialConfigurationOfSocketJoin;
      case "new-chat-message":
        return this.addNewChatMessage;
      case "new-group-message":
        return this.addNewChatMessageToGroup;
      case "disconnect":
        // Trigger if client refresh a tab several time then you can see it in action
        return () => {
          // console.log("SOCKET ROOMS>>>> ", socket.rooms);
        };
      default:
        return () => {};
    }
  }

  /**
   * Initialize and create the rooms while user is logged in
   * @param {string} payload
   */
  private initialConfigurationOfSocketJoin = async (payload: string) => {
    const parsedPayload = JSON.parse(payload);
    const { user_id: userId, group_ids: groupIds } = parsedPayload || {};

    // Create a seperate room for (direct message)
    if (userId) {
      this.socket.join(`room-${userId}`);
      this.socket.data.userId = userId;
    }

    if (groupIds?.length) {
      // Join to the rooms while he is logged in
      groupIds.forEach((groupId) => {
        this.socket.join(`group-${groupId}`);
      });
    }
  };

  /**
   * Publish event for new chat message and raise the socket event back to receiver client(Direct Message)
   * @param {string} payload
   */
  private addNewChatMessage = async (payload: string) => {
    const parsedPayload = JSON.parse(payload);
    const { sender_id, sender_name, receiver_id, message } = parsedPayload;

    if (!sender_id && !receiver_id && !message) {
      return;
    }

    const eventPayload = {
      ...parsedPayload,
      type: "direct_message",
    };
    // Publish event for new message
    this.communicationPublisher.raiseEventForSendMessage(eventPayload);

    // Raise the event back to receiver client (Direct Message)
    this.io.to(`room-${receiver_id}`).emit("received-user-chat", {
      user_id: sender_id,
      name: sender_name,
      message,
      type: "direct_message",
      created_at: moment.utc().utcOffset("+05:30").format("hh:mm a"),
    });
  };

  /**
   * Publish event for new chat message and raise the socket event back to receiver client(Group Message)
   * @param {string}  payload
   */
  private addNewChatMessageToGroup = async (payload: string) => {
    const parsedPayload = JSON.parse(payload);
    const {
      sender_id,
      sender_name,
      group_id: group_short_id,
      message,
    } = parsedPayload;

    if (!sender_id && !group_short_id && !message) {
      return;
    }

    const eventPayload = {
      ...parsedPayload,
      type: "group_message",
    };
    // Publish event for group message
    this.communicationPublisher.raiseEventForSendMessage(eventPayload);

    // Raise the client event to group room (Group Message)
    this.socket.broadcast.to(`group-${group_short_id}`).emit("received-user-chat", {
      user_id: sender_id,
      name: sender_name,
      message,
      group_id: group_short_id,
      type: "group_message",
      created_at: moment.utc().utcOffset("+05:30").format("hh:mm a"),
    });
  };
}

export default SocketEvents;
