import RevplusDao from "@/dao/revplusleads.dao";

class RevplusService {
  private revplusDao = new RevplusDao();

  // Pre-Process the lead
  public createLead = async (payload: {
    email: string;
    user_agent: string;
    ip_address: string;
  }) => {
    const { email, user_agent: userAgent, ip_address: ipAddress } = payload;
    const isLeadHistoryAvailable = userAgent && ipAddress;

    const lead = await this.revplusDao.getLeadsByEmail(email);

    if (lead) {
      // Store the lead history if exists
      isLeadHistoryAvailable &&
        (await this.revplusDao.updateLeadByEmail(email, {
          lead_history: { $push: { userAgent, ipAddress } },
        }));
      return;
    }

    // Create lead in case of no such lead exist with the email
    const leadPayload = {
      email,
      ...(isLeadHistoryAvailable
        ? { lead_history: { $push: { userAgent, ipAddress } } }
        : {}),
      is_verified: false,
    };
    await this.revplusDao.createLead(leadPayload);
  };
}

export default RevplusService;
