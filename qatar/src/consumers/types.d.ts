export interface IRedisConsumerConfig {
  consumer_name: string; 
}

export interface IRedisBullConsumerConfig {
  consumer_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface IAddListenerPayload {
  messageHandler?: (message: any) => void;
  onConsumerError?: (error: any) => void;
}
