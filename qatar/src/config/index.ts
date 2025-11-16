const nconf = require("nconf");
import {
  IConsumers,
  IGCPConfig,
  IRedisConfig,
  IServer,
  IServices,
} from "../typings/config";

export const env = process.env.NODE_ENV || "development";
const configFile = `/etc/secrets/config.${env}.json`;

nconf.argv().env().file({ file: configFile });

export const serviceName = nconf.get("service_name");
export const serviceRoute = nconf.get("service_route");
export const PORT = (nconf.get("server") as IServer).port;
export const isProduction = env === "prod";

export const gcpConfig = nconf.get("gcp") as IGCPConfig;
export const redisConfig = nconf.get("redis") as IRedisConfig;
export const consumers = nconf.get("consumers") as IConsumers;

export const services = nconf.get("services") as IServices;
