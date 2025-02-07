import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";

class CommunicationService {
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();

  public createChat = async (payload: {
    senderId: string;
    receiverId: string;
    message: string;
  }) => {
    const { senderId, receiverId, message } = payload;
    await this.communicationDao.createMessage({
      sender_user_id: senderId,
      receiver_user_id: receiverId,
      message,
    });
  };

  public getUsersChat = async (userDetails: IUser, receiverId: string) => {
    const chatDetails = await this.communicationDao.getChatDetails(
      userDetails._id.toString(),
      receiverId
    );

    const formattedChatDetails = {
      username: `${userDetails.first_name} ${userDetails.last_name}`,
      user_id: receiverId,
      chats: chatDetails,
    };

    return formattedChatDetails;
  };
}

export default CommunicationService;
