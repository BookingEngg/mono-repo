import { IUser } from "@/interfaces/user.interface";
import UsersModel from "@/models/user.model";

class UserDao {
  private userModel = UsersModel;

  public createUser = async () => {
    return await this.userModel.create({
      first_name: "Tushar",
      contact: "9990870405",
      email: "tusharepc205@gmail.com",
      roles: ['director'],
    });
  };

  
  public getUserByEmail = async (email: string): Promise<IUser> => {
    return await this.userModel.findOne({ email });
  };
}

export default UserDao;
