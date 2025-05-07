import {
  redisConfig,
  isProduction,
  serverRoute,
  PORT,
  serviceRoute,
} from "@config";

export const getRedisUrl = () => {
  const { username, password, host, port } = redisConfig;
  return `redis://${username}:${password}@${host}:${port}`;
};

export const getExternalDomain = () => {
  const externalUrl = `${isProduction ? "https://" : "http://"}${serverRoute}${isProduction ? "" : `:${PORT}`}/${serviceRoute}/api/v1/platform`;
  return externalUrl;
};
