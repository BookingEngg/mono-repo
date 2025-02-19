import { mongoDbConfig, MONGO_DB_NAMES, env } from "@/config";
import mongoose from "mongoose";
import { IDataBase } from "@/typings/config";

mongoose.set('debug', true);

const mongoConnectionInstance: Record<string, mongoose.Connection> = {};
const isDevelopment = env === "development";

const getConnectionUrl = (config) => {
  const url = [
    "mongodb",
    !isDevelopment ? `+srv://${config.username}:${config.password}` : "://",
    `${config.url}${config.name}${config.post_url}`,
  ].join("");
  return url;
};

const getDataBaseConnection = (config: IDataBase) => {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    const logMessage = `Mongoose Query - Collection: ${collectionName} | Method: ${method} | Query: ${JSON.stringify(query)} | Doc: ${JSON.stringify(
      doc,
    )}`;
    console.debug(logMessage);
  });
  return mongoose.createConnection(getConnectionUrl(config));
};

const initMongoInstances = (dbNames: readonly string[]) => {
  dbNames.forEach((db) => {
    const dbConfig = mongoDbConfig[db];

    if (!dbConfig) {
      throw new Error("Config Not Found");
    }

    const connection = getDataBaseConnection(dbConfig);
    mongoConnectionInstance[dbConfig.name] = connection;
  });
};

initMongoInstances(MONGO_DB_NAMES);

export const MONGO_INSTANCES = mongoConnectionInstance;
