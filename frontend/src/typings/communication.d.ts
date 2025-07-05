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
  sender_name: string,
  receiver_id: string,
}

export interface INewChatMessageReceive {
  user_id: string;
  name: string;
  message: string;
  created_at: string;
}