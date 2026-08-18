import { ILink } from "@/interfaces/link.interface";
import LinkModel from "@/models/link.model";

class LinkDao {
  private linkModel = LinkModel;

  public createLink = async (payload: Partial<ILink>) => {
    return await this.linkModel.create(payload);
  };

  public getLinkByShortId = async (shortId: string) => {
    return await this.linkModel.findOne({ short_id: shortId }).lean();
  };
}

export default LinkDao;
