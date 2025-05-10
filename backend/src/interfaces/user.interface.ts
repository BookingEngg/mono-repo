import {
  BlockedStatus,
  RequestStatusType,
  BlockedType,
} from "@/constants/common.constants";

export interface IBlockedUser {
  user_id: string;
  blocked_status: BlockedStatus;
  block_origin: BlockedType;
}

export interface IRequestedUser {
  user_id: string;
  request_status: RequestStatusType;
}

export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: number;
  roles: string[];
  level: number;
  origin: IOrigin;
  email_verified: boolean;
  user_profile_picture?: string;

  friends_ids: string[];
  blocked_user: IBlockedUser[];
  requested_friends: IRequestedUser[];
}

export interface ICommonAuthUser {
  first_name: string;
  last_name: string;
  email: string;
  email_verified: boolean;
  user_profile_picture: string;
}

export interface IOrigin {
  country: string;
  state: string;
  zipcode: number;
}

export interface IOtp {
  _id: string;
  email: string;
  user_id: string;
  otp: number;
  is_verified: boolean;
  otp_response: object;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunication {
  sender_user_id: string;
  receiver_user_id: string;
  message: string;
}
