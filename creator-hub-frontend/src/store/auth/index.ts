import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuth, IUser } from "./types";

const initialState: IAuth = {
  user: null,
  isAuthorized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state: IAuth, action: PayloadAction<IAuth>) => {
      return {
        ...state,
        user: action.payload.user,
        isAuthorized: action.payload.isAuthorized,
      };
    },
    logout: (state: IAuth) => {
      return {
        ...state,
        user: null,
        isAuthorized: false,
      };
    },
    // Merges a partial update (e.g. after saving the onboarding form) into
    // the current user rather than requiring a full re-login/re-fetch.
    updateUser: (state: IAuth, action: PayloadAction<Partial<IUser>>) => {
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : state.user,
      };
    },
  },
});

export const getAuthUser = (state: { auth: IAuth }): IAuth => {
  return state.auth;
};

export const isUserAuthorized = (state: { auth: IAuth }): boolean => {
  return state.auth.isAuthorized;
};

export const { login, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
