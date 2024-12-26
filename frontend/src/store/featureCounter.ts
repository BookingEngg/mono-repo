import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface StateType {
  count: number;
}

const initialState: StateType = {
  count: 0,
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state: StateType) => {
      state.count += 1;
    },
    decrement: (state: StateType) => {
      state.count -= 1;
    },

    incrementByAmount: (state: StateType, action: PayloadAction<number>) => {
      state.count += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
