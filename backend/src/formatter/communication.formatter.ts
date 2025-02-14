import { ICommunication, IUser } from "@/interfaces/user.interface";

class CommunicationFormatter {
  public getFormattedChatDetails = (payload: {
    userDetailsMapper: Record<string, IUser>;
    chatDetails: ICommunication[];
    user: IUser;
    receiverId: string;
  }) => {
    const { userDetailsMapper, user, chatDetails, receiverId } = payload;

    return {
      username: `${user.first_name} ${user.last_name}`,
      receiver_id: receiverId,
      chats: chatDetails.map((chat: ICommunication) => {
        return {
          message: chat.message,
          user_id: chat.sender_user_id,
          user_name: userDetailsMapper[chat.sender_user_id].first_name,
        };
      }),
    };
  };
}

export default CommunicationFormatter;
