export interface IRedisConsumerConfig {
  stream: string;
  consumer_group: string;
  consumer_name: string; 
}

export interface IRedisBullConsumerConfig {
  queue: string;
  host: string;
  port: number;
}

export interface IAddListenerPayload {
  messageHandler?: (message: any) => void;
  onConsumerError?: (error: any) => void;
}
