import nodeFetch from "node-fetch";
import {
  redisConfig,
  isProduction,
  serverRoute,
  PORT,
  serviceRoute,
  uiConfigs,
} from "@config";

// node-fetch is pinned to v2 (CommonJS) rather than v3 (ESM-only) —
// TypeScript downlevels a dynamic `import()` to a plain `require()` when
// compiling to CommonJS (this backend's module target), so an ESM-only v3
// package can never actually load here no matter how it's imported.
export const fetch = nodeFetch;

export const getRedisUrl = (): object => {
  const { username, password, host, port } = redisConfig;
  return { url: `redis://${username}:${password}@${host}:${port}` };
};

export const getExternalDomain = () => {
  const externalUrl = isProduction ? `https://${serverRoute}` : `http://${serverRoute}/api/v1/platform`;
  return externalUrl;
};

export const getRedirectionUrlToUi = () => {
  const { url, port } = uiConfigs;

  const externalUrl = `${isProduction ? "https://" : "http://"}${url}${isProduction ? "" : `:${port}`}/`;
  return externalUrl;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
