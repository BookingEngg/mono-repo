const nconf = require("nconf");

const env = process.env.NODE_ENV || "development";
const configFile = `/etc/secrets/config.${env}.json`;

nconf.argv().env().file({ file: configFile });

const serviceName = nconf.get("service_name");
const serviceRoute = nconf.get("service_route");
const PORT = nconf.get("server").port;
const isProduction = env === "prod";

const gcpConfig = nconf.get("gcp");
const redisConfig = nconf.get("redis");
const consumers = nconf.get("consumers");

const services = nconf.get("services");

module.exports = {
  services,
  consumers,
  serviceName,
  serviceRoute,
  PORT,
  isProduction,
  gcpConfig,
  redisConfig,
  env,
};
