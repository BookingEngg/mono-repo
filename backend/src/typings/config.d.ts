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
