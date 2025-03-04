import axios, { AxiosInstance } from "axios";

const getClient = (baseURL: string, timeout: number = 180000) => {
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    timeout,
    withCredentials: true,
  });

  return {
    get: (getPayload: { url: string; params?: object }) => {
      const { url, params, ...rest } = getPayload;
      return axiosInstance.request({
        url,
        method: "GET",
        params,
        responseType: "json",
        ...rest,
      });
    },
    post: (postPayload: { url: string; body?: object }) => {
      const { url, body, ...rest } = postPayload;
      return axiosInstance.request({
        url,
        method: "POST",
        data: body,
        responseType: "json",
        ...rest,
      });
    },
    put: (putPayload: { url: string; body?: object }) => {
      const { url, body, ...rest } = putPayload;
      return axiosInstance.request({
        url,
        method: "PUT",
        data: body,
        responseType: "json",
        ...rest,
      });
    },
  };
};

// TODO: move this to .env
const BASE_URL = "https://mono-repo-c6ep.onrender.com/backend/api/v1/platform";

const axiosClient = getClient(BASE_URL);
export default axiosClient;
