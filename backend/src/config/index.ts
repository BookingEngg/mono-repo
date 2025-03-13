import nconf from "nconf";
import {
  IDataBaseConfig,
  IGoogleOAuth,
  INodeMailer,
  IServer,
  IToken,
} from "@/typings/config";

export const env = process.env.NODE_ENV || "development";

// TODO: configuration for render platform
const configFile = `/etc/secrets/config.${env}.json`

nconf.argv().env().file({ file: configFile });

export const serviceName = nconf.get("service");
export const serviceRoute = nconf.get("service_route");
export const PORT = (nconf.get("server") as IServer).port;
export const isProduction = env === "prod";

export const MONGO_DB_NAMES: readonly string[] = ["praman"];
export const mongoDbConfig = nconf.get("databases").mongodb as IDataBaseConfig;

export const SOCKET_EVENTS_NAMES: readonly string[] = [
  "init",
  "new-chat-message",
];

export const nodeMailConfig = nconf.get("nodemailer") as INodeMailer;

export const tokenDetails = nconf.get("token") as IToken;
export const googleOAuthConfigs = nconf.get("google_auth") as IGoogleOAuth;
