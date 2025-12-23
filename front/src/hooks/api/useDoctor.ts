import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "helpers/apiClient";
import { toast } from "react-toastify";
import { ApiResponse, AxiosError } from "hooks/types/apiResponse";
import { Doctor } from "hooks/types/doctors";
import { invalidateQuery } from "helpers/invalidateQuery";
import { DOCTOR, GET_ALL_DOCTORS } from "constants/endPoints";

type createDoctor = Omit<Doctor, "id">;

export const useDoctor = (fetchDoctors = false) => {
  const queryClient = useQueryClient();
  const url = DOCTOR;

  const getAllDoctors = useQuery<ApiResponse<Doctor[]>, Error>({
    queryKey: [url, "all"],
    queryFn: async () => {
      const { data } = await api.get(`${GET_ALL_DOCTORS}`);
      if (!data) throw new Error("Failed to fetch doctors");
      return data || [];
    },
    enabled: fetchDoctors,
  });

  const createDoctor = useMutation<
    ApiResponse<Doctor>,
    AxiosError,
    createDoctor
  >({
    mutationFn: async (values) => {
      const { data } = await api.post<ApiResponse<Doctor>>(
        `${url}/CreateDoctor`,
        values
      );
      if (!data) throw new Error("Failed to add doctor");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add doctor");
    },
  });

  const updateDoctor = useMutation<ApiResponse<Doctor>, AxiosError, Doctor>({
    mutationFn: async (values) => {
      const { data } = await api.patch<ApiResponse<Doctor>>(
        `${url}/UpdateDoctor`,
        values
      );
      if (!data) throw new Error("Failed to update doctor");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to update doctor");
    },
  });

  const deleteDoctor = useMutation<ApiResponse<Doctor>, AxiosError, number>({
    mutationFn: async (id) => {
      const { data } = await api.delete<ApiResponse<Doctor>>(
        `${url}/DeleteDoctor/${id}`
      );
      if (!data) throw new Error("Failed to delete doctor");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to delete doctor");
    },
  });

  const actions = {
    getAllDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };

  return { ...actions };
};
