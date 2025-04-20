import { ICommunication } from "@/interfaces/user.interface";
import CommunicationModel from "@/models/communication.model";

class CommunicationDao {
  private communicationModel = CommunicationModel;

  public createMessage = async (payload: ICommunication) => {
    await this.communicationModel.create(payload);
  };

  public getChatDetails = async (payload: {
    user_id: string;
    receiverId: string;
    fields?: string[];
  }) => {
    const { user_id, receiverId, fields = [] } = payload;
    return await this.communicationModel
      .find({
        $or: [
          { sender_user_id: user_id, receiver_user_id: receiverId },
          { sender_user_id: receiverId, receiver_user_id: user_id },
        ],
      })
      .select(fields)
      .sort({ createdAt: 1 })
      .limit(100);
  };

  public getLastReceivedChat = async (
    user_id: string,
    friends_ids: string[]
  ) => {
    return await this.communicationModel.aggregate([
      {
        $match: {
          $or: [
            { sender_user_id: user_id },
            { receiver_user_id: { $in: friends_ids } },
          ],
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $group: {
          _id: "$receiver_user_id",
          last_message: { $first: "$$ROOT" },
        },
      },
    ]);
  };
}

export default CommunicationDao;
