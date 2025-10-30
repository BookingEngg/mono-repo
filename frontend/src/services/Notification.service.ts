// Client
import axiosClient from "@/services/http";

export const subscribeNotification = async (subscription: object) => {
  const response = await axiosClient.post({
    url: `/notification/subscribe`,
    body: { subscription },
  });

  return response.data;
};
