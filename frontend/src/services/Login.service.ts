import { IUser } from "@/store/auth/types";

const prefix = "http://localhost:8080/backend/api/v1/platform";

export const sendOtp = async (loginPayload: { email: string }) => {
  return await fetch(`${prefix}/otp/create`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginPayload),
    method: "POST",
    mode: "cors",
  });
};

export const verifyOtp = async (payload: {
  email: string;
  otp: string;
}): Promise<{ message: string; status: boolean }> => {
  const response = await fetch(`${prefix}/otp/verify`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    method: "POST",
    mode: "cors",
    credentials: "include",
  });
  return response.json();
};

export const getUser = async (): Promise<{ status: string; user: IUser }> => {
  const response = await fetch(`${prefix}/user`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    mode: "cors",
    credentials: "include",
  });
  return response.json();
};
