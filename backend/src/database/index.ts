import { mongoDbConfig, MONGO_DB_NAMES, env, isProduction } from "@/config";
import mongoose from "mongoose";
import { IDataBase } from "@/typings/config";

const mongoConnectionInstance: Record<string, mongoose.Connection> = {};
mongoose.set("debug", isProduction);

const getConnectionUrl = (config) => {
  const url = [
    "mongodb",
    isProduction ? `+srv://${config.username}:${config.password}` : "://",
    `${config.url}`,
    `${!isProduction ? "/" : ""}${config.name}`,
    config.post_url,
  ].join("");
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
