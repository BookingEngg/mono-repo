import UserDao from "@/dao/user.dao";

class UserService {
  private userDao = new UserDao();

  public createUser = async () => {
    return await this.userDao.createUser();
  };
  
}

export default UserService;
