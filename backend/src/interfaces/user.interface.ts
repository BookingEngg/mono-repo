export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact: number;
  roles: string[];
  level: number;
  origin: IOrigin;
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
