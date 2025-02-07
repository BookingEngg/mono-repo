import { ICommunication } from "@/interfaces/user.interface";
import CommunicationModel from "@/models/communication.model";

class CommunicationDao {
  private communicationModel = CommunicationModel;

  public createMessage = async (payload: ICommunication) => {
    await this.communicationModel.create(payload);
  };

  public getChatDetails = async (user_id: string, receiverId: string) => {
    return await this.communicationModel
      .find({
        $or: [
          { sender_user_id: user_id, receiver_user_id: receiverId },
          { sender_user_id: receiverId, receiver_user_id: user_id },
        ],
      })
      .limit(100);
  };
}

export default CommunicationDao;
