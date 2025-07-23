export interface IEntity {
  id: string;
  name: string;
  profile_picture: string;
  last_message: string;
  last_online_at: string;

  unsend_last_message: string;
}

export interface IChatPayload {
  message: string;
  sender_id: string,
  sender_name: string,
  group_id?: string,
  receiver_id?: string,
}

export interface INewChatMessageReceive {
  type: string;   // direct_message or group_message
  user_id: string;  // sender id
  name: string;   // sender name
  message: string;  // message content
  created_at: string; // message time
  group_id?: string;  // in case of group message
}