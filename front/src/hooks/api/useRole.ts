import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "helpers/apiClient";
import { toast } from "react-toastify";
import { ApiResponse, AxiosError } from "hooks/types/apiResponse";
import { Role } from "hooks/types/role";
import { invalidateQuery } from "helpers/invalidateQuery";
import { ROLES } from "constants/endPoints";
import { Permission } from "hooks/types/auth";

export const useRole = (fetchRoles = false) => {
  const queryClient = useQueryClient();
  const url = ROLES;

  const getAllRoles = useQuery<ApiResponse<Role[]>, Error>({
    queryKey: [url, "all"],
    queryFn: async () => {
      const { data } = await api.get(`${url}/GetAllRoles`);
      if (!data) throw new Error("Failed to fetch roles");
      return data || [];
    },
    enabled: fetchRoles,
  });

  const addRole = useMutation<ApiResponse<Role>, AxiosError, Role>({
    mutationFn: async (values) => {
      const { data } = await api.post<ApiResponse<Role>>(
        `${url}/CreateRole`,
        values
      );
      if (!data) throw new Error("Failed to add role");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
      return data;
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add role");
    },
  });

  const updateRole = useMutation<ApiResponse<Permission[]>, AxiosError, Role>({
    mutationFn: async (values: Role) => {
      const { data } = await api.patch<ApiResponse<Permission[]>>(
        `${url}/UpdateRole/${values.roleId}`,
        values
      );
      if (!data) throw new Error("Failed to add role");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
      return data;
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add role");
    },
  });

  const deleteRole = useMutation<ApiResponse<Role>, AxiosError, string>({
    mutationFn: async (roleId) => {
      const { data } = await api.delete(`${url}/DeleteRole/${roleId}`);
      if (!data) throw new Error("Failed to delete role");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
      return data;
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to delete role");
    },
  });

  return { getAllRoles, addRole, updateRole, deleteRole };
};

export default useRole;
