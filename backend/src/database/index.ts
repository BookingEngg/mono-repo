import { mongoDbConfig, env, isProduction } from "@/config";
import mongoose from "mongoose";
import { IDataBase } from "@/typings/config";

const mongoConnectionInstance: Record<string, mongoose.Connection> = {};
// mongoose.set("debug", isProduction);

const getConnectionUrl = (config: IDataBase) => {
  const hasCredentials = Boolean(config.username && config.password);

  if (hasCredentials) {
    // Atlas/SRV-style cluster — port is resolved via DNS SRV records, not specified here
    return `mongodb+srv://${config.username}:${config.password}${config.url}${config.name}${config.post_url}`;
  }

  // Local/standard connection — needs an explicit host:port
  return `mongodb://${config.url}:${config.port}/${config.name}${config.post_url}`;
};

const getDataBaseConnection = (config: IDataBase) => {
  if (isProduction) {
    mongoose.set("debug", (collectionName, method, query, doc) => {
      const logMessage = `Mongoose Query - Collection: ${collectionName} | Method: ${method} | Query: ${JSON.stringify(query)} | Doc: ${JSON.stringify(
        doc,
      )}`;
      console.debug(logMessage);
    });
  }
  return mongoose.createConnection(getConnectionUrl(config));
};

const initMongoInstances = () => {
  const dbConfig = mongoDbConfig["praman"];

  if (!dbConfig) {
    throw new Error("Config Not Found");
  }

  const connection = getDataBaseConnection(dbConfig);
  mongoConnectionInstance[dbConfig.name] = connection;
};

initMongoInstances();

export const MONGO_INSTANCES = mongoConnectionInstance;
