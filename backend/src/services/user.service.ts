import UserDao from "@/dao/user.dao";

class UserService {
  private userDao = new UserDao();

  public createUser = async () => {};

  public getChatUsers = async (email: string) => {
    const chatUsers = await this.userDao.getUsers(email);

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
