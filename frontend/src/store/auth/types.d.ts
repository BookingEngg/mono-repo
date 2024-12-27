export interface IUser {
  _id: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface IAuth {
  user: IUser | null;
  isAuthorized: boolean;
}