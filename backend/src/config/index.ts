import nconf from "nconf";
import { IDataBaseConfig, IServer } from "@/typings/config";

export const env = process.env.NODE_ENV || "development";
const configFile = `src/config/config.${env}.json`;

nconf.argv().env().file({ file: configFile });

export const serviceName = nconf.get("service");
export const serviceRoute = nconf.get("service_route");
export const PORT = (nconf.get("server") as IServer).port;

export const MONGO_DB_NAMES: readonly string[] = ["praman"];
export const mongoDbConfig = nconf.get("databases").mongodb as IDataBaseConfig;
