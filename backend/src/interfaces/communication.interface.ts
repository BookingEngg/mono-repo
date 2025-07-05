import { CommunicationType, GroupType } from "./enum";

export interface ICommunication {
  _id?: string;
  message_type: CommunicationType;
  sender_user_id?: string;
  receiver_user_id?: string;
  message: string;
  group_id?: string;
  is_edited?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICommunicationGroup {
  short_id: string;
  name: string;
  description: string;
  admin_id: string;
  group_member_ids: string[];
  group_profile_picture?: string;
  group_type: GroupType;

  is_active: boolean;
  is_visible: boolean;
}
