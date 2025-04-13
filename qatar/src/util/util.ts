import { IRedisConfig } from "@/typings/config";
import { isProduction } from "@/config";

export const getRedisClientConnectionUrl = (config: IRedisConfig) => {
  const { username, password, host, port } = config;
  const connectionUrl = [
    "redis://",
    `${isProduction ? username + ":" : ""}`,
    `${isProduction ? password + "@" : ""}`,
    `${host}:${port}`,
  ].join("");
  return connectionUrl;
};
