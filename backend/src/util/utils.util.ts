import { redisConfig } from "@config";

export const getRedisUrl = () => {
  const { username, password, host, port } = redisConfig;
  return `redis://${username}:${password}@${host}:${port}`;
};
