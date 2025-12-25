export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  user_profile_picture?: string;
  role: string;
  group_ids: string[];
  roles: string[];
  privileges: string[];
}

export interface IAuth {
  user: IUser | null;
  isAuthorized: boolean;
}