import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Permission } from "hooks/types/auth";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  JWT_token: string;
  permissions: Permission[];
}

const defaultUserState = {
  id: "",
  name: "",
  email: "",
  role: "",
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: defaultUserState,
  JWT_token: "",
  permissions: [],
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.user.name = action.payload;
    },
    setUser: (
      state,
      action: PayloadAction<{
        user: AuthState["user"];
        JWT_token: string;
        permissions: Permission[];
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.JWT_token = action.payload.JWT_token;
      state.permissions = action.payload.permissions;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.JWT_token = action.payload;
    },
    setPermissions: (state, action: PayloadAction<Permission[]>) => {
      state.permissions = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = defaultUserState;
      state.JWT_token = "";
    },
  },
});

export const { setUser, logout, setToken, setName, setPermissions } =
  authSlice.actions;
export default authSlice.reducer;
