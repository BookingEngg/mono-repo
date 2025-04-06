export interface IRedisConsumerConfig {
  stream: string;
  consumer_group: string;
  consumer_name: string; 
}

export interface IAddListenerPayload {
  messageHandler?: (message: any) => void;
  onConsumerError?: (error: any) => void;
}
