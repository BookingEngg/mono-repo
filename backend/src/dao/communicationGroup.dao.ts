import { ICommunicationGroup } from "@/interfaces/communication.interface";
import CommunicationModel from "@/models/groups.model";

class CommunicationGroupDao {
  private communicationModel = CommunicationModel;

  public createGroup = async (payload: ICommunicationGroup) => {
    return await this.communicationModel.create(payload);
  };

  public getGroupDetailsByShortId = async (
    shortId: string,
    fields: string[] = []
  ) => {
    return await this.communicationModel
      .findOne({ short_id: shortId })
      .select(fields)
      .lean();
  };

  public getGroupDetailsByShortIds = async (
    shortIds: string[],
    fields: string[] = []
  ) => {
    return await this.communicationModel
      .find({ short_id: { $in: shortIds } })
      .select(fields)
      .lean();
  };
}

export default CommunicationGroupDao;
