import RevplusLeadsModel from "@/models/revplusleads.model";

class RevplusDao {
  private revplusLeadsModel = RevplusLeadsModel;

  public createLead = async (payload: object) => {
    return await this.revplusLeadsModel.create(payload);
  };

  public getLeadsByEmail = async (email: string) => {
    return await this.revplusLeadsModel.findOne({ email });
  };

  public updateLeadByEmail = async (email: string, payload: object) => {
    return await this.revplusLeadsModel.updateOne({ email }, payload);
  };
}

export default RevplusDao;
