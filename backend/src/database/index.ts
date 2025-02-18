import { mongoDbConfig, MONGO_DB_NAMES, env } from "@/config";
import mongoose from "mongoose";
import { IDataBase } from "@/typings/config";

const mongoConnectionInstance: Record<string, mongoose.Connection> = {};
const isDevelopment = env === "development";

const getConnectionUrl = (config) => {
  const url = [
    "mongodb",
    !isDevelopment ? `+srv://${config.username}:${config.password}` : "://",
    config.url,
    `/${config.name}`,
  ].join("");
  console.log("CONNECTION URL>>>>>>>>>>", url);
  return url;
};

const getDataBaseConnection = (config: IDataBase) => {
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
