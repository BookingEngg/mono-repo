export interface IServer {
  port: number;
}

export interface IDataBaseConfig {
  praman: IDataBase;
}

export interface IDataBase {
  name: string
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
}
