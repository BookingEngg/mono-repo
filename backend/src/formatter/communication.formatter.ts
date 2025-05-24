import { ICommunication } from "@/interfaces/communication.interface";
import { IUser } from "@/interfaces/user.interface";
import moment from "moment";

class CommunicationFormatter {
  public getFormattedChatDetails = (payload: {
    userDetailsMapper: Record<string, IUser>;
    chatDetails: ICommunication[];
    receiverId: string;
  }) => {
    const { userDetailsMapper, chatDetails, receiverId } = payload;
    const receiverUser = userDetailsMapper[receiverId];

    return {
      username: `${receiverUser.first_name} ${receiverUser.last_name}`,
      receiver_id: receiverId,
      chats: chatDetails.map((chat: ICommunication & { createdAt: Date }) => {
        return {
          message: chat.message,
          user_id: chat.sender_user_id,
          user_name: userDetailsMapper[chat.sender_user_id].first_name,
          created_at: moment
            .utc(chat.createdAt)
            .utcOffset("+05:30")
            .format("hh:mm a"),
        };
      }),
    };
  };

  /**
   * Get formatted message formatter by dates
   */
  public getFormattedMessages = (payload: {
    messagesDataHashByDate: Record<string, ICommunication[]>;
    userDetailsHashById: Record<string, IUser>;
    userId: string;
  }) => {
    const { messagesDataHashByDate, userDetailsHashById, userId } = payload;

    const formattedResponse = Object.keys(messagesDataHashByDate).map(
      (messageDate: string) => {
        const messages: ICommunication[] = messagesDataHashByDate[messageDate];

        const messageItems = messages.map((messageItem) => {
          const messageUser = userDetailsHashById[messageItem.sender_user_id];
          const isSendByCurrentUser = userId === messageItem.sender_user_id;

          const messageTime = moment
            .utc(messageItem.createdAt)
            .format("hh:mm a");

          return {
            content: messageItem.message,
            sender_id: messageItem.sender_user_id,
            sender_name: messageUser?.first_name || "",
            timestamp: messageTime,
            is_sent_by_current_user: isSendByCurrentUser,
          };
        });

        return {
          date: messageDate,
          items: messageItems,
        };
      }
    );

    return formattedResponse;
  };
}

export default CommunicationFormatter;
