import R from "ramda";
import CommunicationDao from "@/dao/communication.dao";
import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import CommunicationFormatter from "@/formatter/communication.formatter";

class CommunicationService {
  private userDao = new UserDao();
  private communicationDao = new CommunicationDao();

  private communicationFormatter = new CommunicationFormatter();

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
    const senderId = userDetails._id.toString();

    const [chatDetails, usersDetails] = await Promise.all([
      this.communicationDao.getChatDetails({
        user_id: senderId,
        receiverId,
        fields: ["sender_user_id", "receiver_user_id", "message"],
      }),
      this.userDao.getUserByUserIds([senderId, receiverId], ["first_name"]),
    ]);
    const userDetailsMapper = R.indexBy(R.prop<string>("_id"), usersDetails);

    return this.communicationFormatter.getFormattedChatDetails({
      userDetailsMapper,
      user: userDetails,
      chatDetails,
      receiverId,
    });
  };
}

export default CommunicationService;
