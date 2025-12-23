import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const defaultState = {
  isLoading: false,
};

const globalSlice = createSlice({
  name: "global",
  initialState: defaultState,
  reducers: {
    toggleLoadingState: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { toggleLoadingState } = globalSlice.actions;

export default globalSlice.reducer;
