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
          created_at: moment.utc(chat.createdAt).utcOffset("+05:30").format("hh:mm a"),
        };
      }),
    };
  };
}

export default CommunicationFormatter;
