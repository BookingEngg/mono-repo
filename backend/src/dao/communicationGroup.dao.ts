import { ICommunicationGroup } from "@/interfaces/communication.interface";
import CommunicationModel from "@/models/communicationGroup.model";

class CommunicationGroupDao {
  private communicationModel = CommunicationModel;

  public createGroup = async (payload: ICommunicationGroup) => {
    return await this.communicationModel.create(payload);
  }
}

export default CommunicationGroupDao;