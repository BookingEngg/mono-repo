export interface IServer {
  port: number;
}

export interface IGCPConfig {
  project_id: string;
  client_email: string;
  private_key: string;
  private_key_id: string;
  client_id: string;
}

export interface IRedisConfig {
  host: string;
  username: string;
  password: string;
  port: number;
}

export interface IConsumers {
  [key: string]: {
    queue_type: string;
    consumer_name?: string; // Redis Bull Consumer Name
    topic?: string; // PubSub Topic Name
    subscription_name?: string; // PubSub Subscription Name
  };
}

export interface IServices {
  backend: string;
}
