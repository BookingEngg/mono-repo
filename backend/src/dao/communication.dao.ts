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

  public getLastReceivedChat = async (user_id: string) => {
    return await this.communicationModel.aggregate([
      {
        $match: {
          $or: [
            { sender_user_id: user_id.toString() },
            { receiver_user_id: user_id.toString() },
          ],
        },
      },
      {
        $addFields: {
          conversation_id: {
            $cond: [
              { $gt: ["$sender_user_id", "$receiver_user_id"] },
              { $concat: ["$receiver_user_id", "_", "$sender_user_id"] },
              { $concat: ["$sender_user_id", "_", "$receiver_user_id"] },
            ],
          },
        },
      },
      {
        $sort: { updatedAt: -1 },
      },
      {
        $group: {
          _id: "$conversation_id",
          last_message: { $first: "$$ROOT" },
        },
      },
    ]);
  };
}

export default CommunicationDao;
