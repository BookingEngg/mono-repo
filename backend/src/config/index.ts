import nconf from "nconf";
import {
  IDataBaseConfig,
  INodeMailer,
  IOAuth,
  IPublisher,
  IRedisConfig,
  IServer,
  IToken,
  IUiConfig,
} from "@/typings/config";

export const env = process.env.NODE_ENV || "development";
let configFile = `src/config/config.${env}.json`;

nconf.argv().env().file({ file: configFile });

export const serviceName = nconf.get("service_name");
export const serviceRoute = nconf.get("service_route");
export const serverRoute = (nconf.get("server") as IServer).url;
export const PORT = (nconf.get("server") as IServer).port;
export const isProduction = env === "prod";

export const uiConfigs = nconf.get("ui") as IUiConfig;

export const MONGO_DB_NAMES: readonly string[] = ["praman"];
export const mongoDbConfig = nconf.get("databases").mongodb as IDataBaseConfig;
export const redisConfig = nconf.get("redis") as IRedisConfig;

export const publishers = nconf.get("publishers") as IPublisher;

export const SOCKET_EVENTS_NAMES: readonly string[] = [
  "init",
  "new-chat-message",
  "client-connect",
];

export const nodeMailConfig = nconf.get("nodemailer") as INodeMailer;

export const tokenDetails = nconf.get("token") as IToken;
export const googleOAuthConfigs = (nconf.get("o_auth") as IOAuth).google;
export const githubOAuthConfigs = (nconf.get("o_auth") as IOAuth).github;
