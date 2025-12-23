import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Role } from "hooks/types/role";

const defaultState = {
  role: {} as Role,
  dialogVisible: false,
};

const roleSlice = createSlice({
  name: "role",
  initialState: defaultState,
  reducers: {
    editRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
      state.dialogVisible = true;
    },
    toggleDialog: (state, action: PayloadAction<boolean>) => {
      state.dialogVisible = action.payload;
    },
    resetRole(state) {
      state.role = {} as Role;
      state.dialogVisible = false;
    },
  },
});

export const { editRole, toggleDialog, resetRole } = roleSlice.actions;
export default roleSlice.reducer;
