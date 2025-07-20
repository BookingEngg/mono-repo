import { ICommunicationGroup } from "@/interfaces/communication.interface";
import CommunicationModel from "@/models/communicationGroup.model";

class CommunicationGroupDao {
  private communicationModel = CommunicationModel;

  public createGroup = async (payload: ICommunicationGroup) => {
    return await this.communicationModel.create(payload);
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
