import UserDao from "@/dao/user.dao";
import { IUser } from "@/interfaces/user.interface";
import { TokenPayload } from "google-auth-library";

class UserService {
  private userDao = new UserDao();

  public createUser = async (payload: TokenPayload) => {
    const formattedUser = {
      first_name: payload.given_name,
      last_name: payload.family_name,
      email: payload.email,
      email_verified: payload.email_verified,
      user_profile_picture: payload.picture,
      
      roles: [],
      level: 1,
      friends_ids: [],
      requested_friends: [],
      blocked_user: [],
    };
    return await this.userDao.createUser(formattedUser);
  };

  public getInhouseUserDetailsByEmail = async (email) => {
    return this.userDao.getUserByEmail(email);
  };

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
