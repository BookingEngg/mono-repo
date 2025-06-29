export interface IEntity {
  id: string;
  name: string;
  profile_picture: string;
  last_message: string;
  last_online_at: string;
}

export interface IChatPayload {
  message: string;
  sender_id: string,
  receiver_id: string,
}