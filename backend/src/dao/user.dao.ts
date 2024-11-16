import UsersModel from "@/models/user.model";

class UserDao {
  private userModel = UsersModel;

  public createUser = async () => {
    return await this.userModel.create({
      first_name: "Tushar",
      contact_number: "9990870405",
    });
  };

  public getUsers = async () => {
    return await this.userModel.find();
  };
}

export default UserDao;
