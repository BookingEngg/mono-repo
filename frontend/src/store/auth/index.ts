import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialType {
  value: number;
}

const initialValue: InitialType = {
  value: 0,
};

export const userSlice = createSlice({
  name: "user",
  initialState: initialValue,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByValue: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByValue } = userSlice.actions;
export default userSlice.reducer;
