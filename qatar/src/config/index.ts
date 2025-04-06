const nconf = require("nconf");
import { IConsumers, IRedisConfig, IServer } from "../typings/config";

export const env = process.env.NODE_ENV || "development";
let configFile = `src/config/config.${env}.json`;

nconf.argv().env().file({ file: configFile });

export const serviceName = nconf.get("service");
export const serviceRoute = nconf.get("service_route");
export const PORT = (nconf.get("server") as IServer).port;
export const isProduction = env === "prod";

export const redisConfig = nconf.get("redis") as IRedisConfig;
export const consumers = nconf.get("consumers") as IConsumers;
