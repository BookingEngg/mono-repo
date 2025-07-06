import { ICommunication } from "@/interfaces/communication.interface";
import { CommunicationType } from "@/interfaces/enum";
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

  public getDirectMessages = async (
    senderId: string,
    receiverId: string,
    limit: number = 100
  ) => {
    const filterObject = {
      $or: [
        { sender_user_id: senderId, receiver_user_id: receiverId },
        { sender_user_id: receiverId, receiver_user_id: senderId },
      ],
      message_type: CommunicationType.Private,
    };

    const [data, count] = await Promise.all([
      this.communicationModel
        .find(filterObject)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.communicationModel.countDocuments(filterObject),
    ]);

    return { data, count };
  };
}

export default CommunicationDao;
