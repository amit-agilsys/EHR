import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "helpers/apiClient";
import { toast } from "react-toastify";
import { ApiResponse, AxiosError } from "hooks/types/apiResponse";
import { User } from "hooks/types/user";
import { invalidateQuery } from "helpers/invalidateQuery";
import { GET_ALL_USERS, USERS } from "constants/endPoints";

export type CreateUserInput = Omit<User, "id">;

export const useUser = (fetchUsers = false) => {
  const queryClient = useQueryClient();
  const url = USERS;

  const getAllUsers = useQuery<ApiResponse<User[]>, Error>({
    queryKey: [url, "all"],
    queryFn: async () => {
      const { data } = await api.get(`${GET_ALL_USERS}`);
      if (!data) throw new Error("Failed to fetch users");
      return data || [];
    },
    enabled: fetchUsers,
  });

  const addUser = useMutation<ApiResponse<User>, AxiosError, CreateUserInput>({
    mutationFn: async (values) => {
      const { data } = await api.post<ApiResponse<User>>(
        `${url}/createUser`,
        values
      );
      if (!data) throw new Error("Failed to add user");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add user");
    },
  });

  const editUser = useMutation<ApiResponse<User>, AxiosError, User>({
    mutationFn: async (values) => {
      const { data } = await api.patch<ApiResponse<User>>(
        `${url}/updateUser`,
        values
      );
      if (!data) throw new Error("Failed to edit user");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to edit user");
    },
  });

  const deleteUser = useMutation<ApiResponse<User>, AxiosError, string>({
    mutationFn: async (userId) => {
      const { data } = await api.delete(`${url}/deleteUser`, {
        params: { id: userId },
      });
      if (!data) throw new Error("Failed to delete user");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to delete user");
    },
  });

  const actions = {
    getAllUsers,
    addUser,
    editUser,
    deleteUser,
  };
  return { ...actions };
};
