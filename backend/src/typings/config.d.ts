export interface IServer {
  port: number;
}

export interface IDataBaseConfig {
  praman: IDataBase;
}

export interface IRedisConfig {
  host: string;
  username: string;
  password: string;
  port: number;
}

export interface IPublisher {
  [key: string]: {
    stream: string;
    queue: string;
  };
}

export interface IDataBase {
  name: string;
  username: string;
  password: string;
  port: number;
}

export interface INodeMailer {
  host: string;
  port: number;
  user: string;
  password: string;
  expire_in_minutes: number;
}

export interface IToken {
  secret_key: string;
  token_ttl_max_days: number;
}

export interface IGoogleOAuth {
  client_id: string;
  project_id: string;
  auth_uri: string;
  token_uri: string;
  client_secret: string;
}
