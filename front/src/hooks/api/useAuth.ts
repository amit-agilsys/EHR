import { ACCOUNT as url } from "constants/endPoints";
import api from "helpers/apiClient";
import { AuthResponse, ResetPassword, User } from "hooks/types/auth";

export const loginUser = async (data: User) => {
  const response = await api.post(`${url}/login`, data);
  return response.data;
};

export const verifyLogin = async (): Promise<AuthResponse> => {
  const response = await api.post(`${url}/login`);
  return response.data;
};

export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  const response = await api.post(`${url}/ForgotPassword`, { email });
  return response.data;
};

export const resetPassword = async (data: ResetPassword) => {
  const response = await api.post(`${url}/ResetPassword`, {
    password: data.password,
    email: data.email,
    token: data.token,
  });
  return response.data;
};
