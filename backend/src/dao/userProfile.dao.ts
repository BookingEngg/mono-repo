import { IUserProfile } from "@/interfaces/userProfile.interface";
import UserProfileModel from "@/models/userProfile.model";

class UserProfileDao {
  private userProfileModel = UserProfileModel;

  public getProfileByUserId = async (userId: string, fields: string[] = []) => {
    return await this.userProfileModel
      .findOne({ user_id: userId })
      .select(fields)
      .lean();
  };

  public getProfilesByUserIds = async (
    userIds: string[],
    fields: string[] = [],
  ) => {
    return await this.userProfileModel
      .find({ user_id: { $in: userIds } })
      .select(fields)
      .lean();
  };

  /**
   * Upsert, because a profile row is created lazily — a user exists long
   * before they fill in payout details or social handles, so the first write
   * of either has to create the document rather than assume one is there.
   *
   * Takes dot-notation paths (e.g. `social_media_links.instagram`) so a
   * partial update only touches the keys supplied and never clobbers the
   * sibling fields it wasn't given.
   */
  public upsertProfile = async (
    userId: string,
    updates: Record<string, unknown>,
  ) => {
    return await this.userProfileModel
      .findOneAndUpdate(
        { user_id: userId },
        { $set: updates, $setOnInsert: { user_id: userId } },
        { upsert: true, new: true },
      )
      .lean();
  };

  public createProfile = async (payload: Partial<IUserProfile>) => {
    return await this.userProfileModel.create(payload);
  };
}

export default UserProfileDao;
