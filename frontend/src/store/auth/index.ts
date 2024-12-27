import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuth } from "./types";

const initialState: IAuth = {
  user: null,
  isAuthorized: false,
};

const userSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state: IAuth, action: PayloadAction<IAuth>) => {
      state = {
        ...state,
        user: action.payload.user,
        isAuthorized: action.payload.isAuthorized,
      };
    },
    logout: (state: IAuth) => {
      state = {
        ...state,
        user: null,
        isAuthorized: false,
      };
    },
  },
});

export const getAuthUser = (state: { auth: IAuth }): IAuth => {
  return state.auth;
};

export const isLoggedInUser = (state: { auth: IAuth }): boolean => {
  return state.auth.isAuthorized;
};

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
