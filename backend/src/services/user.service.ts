import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";

class UserService {
  private userDao = new UserDao();

  public createUser = async () => {};

  public getChatUsers = async (user: IUser) => {
    const chatUsers = await this.userDao.getUserByUserIds(user.friends_ids);

    const formattedChatUsers = chatUsers.map((user) => {
      return {
        user_id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        time: user.updatedAt,
      };
    });

    return formattedChatUsers;
  };
}

export default UserService;
