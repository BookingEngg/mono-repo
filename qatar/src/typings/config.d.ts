export interface IServer {
  port: number;
}

export interface IRedisConfig {
  host: string;
  username: string;
  password: string;
  port: number;
}

export interface IConsumers {
  config: {
    stream: string;
  },
  communication_queue: {
    consumer_name: string;
    consumer_group: string;
  }
}