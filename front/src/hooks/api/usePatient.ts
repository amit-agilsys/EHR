import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "helpers/apiClient";
import { toast } from "react-toastify";
import { ApiResponse, AxiosError } from "hooks/types/apiResponse";
import { Patient } from "hooks/types/patient";
import { invalidateQuery } from "helpers/invalidateQuery";
import { PATIENTS as url } from "constants/endPoints";

export const useGetPatientById = (id?: string | null) => {
  return useQuery<ApiResponse<Patient>, Error>({
    queryKey: [url, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Patient>>(
        `${url}/GetPatientById/${id}`
      );
      if (!data) throw new Error("Failed to fetch patient by id");
      return data;
    },
    enabled: id ? true : false,
    retry: false,
  });
};

export const usePatient = (fetchPatient = false) => {
  const queryClient = useQueryClient();

  const getAllPatients = useQuery<ApiResponse<Patient[]>, Error>({
    queryKey: [url, "all"],
    queryFn: async () => {
      const { data } = await api.get(`${url}/GetAllPatients`);
      if (!data) throw new Error("Failed to fetch patients");
      return data || [];
    },
    enabled: fetchPatient,
  });

  const addPatient = useMutation<ApiResponse<Patient>, AxiosError, Patient>({
    mutationFn: async (values) => {
      const { data } = await api.post<ApiResponse<Patient>>(
        `${url}/CreatePatient`,
        values
      );
      if (!data) throw new Error("Failed to add patient");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
      return data;
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add patient");
    },
  });

  const editPatient = useMutation<ApiResponse<Patient>, AxiosError, Patient>({
    mutationFn: async (values) => {
      const { data } = await api.patch<ApiResponse<Patient>>(
        `${url}/UpdatePatient`,
        values
      );
      if (!data) throw new Error("Failed to edit patient");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add patient");
    },
  });

  const deletePatient = useMutation<ApiResponse<Patient>, AxiosError, string>({
    mutationFn: async (id) => {
      const { data } = await api.delete(`${url}/DeletePatient/${id}`);
      if (!data) throw new Error("Failed to delete patient");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [url]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add patient");
    },
  });

  const actions = {
    getAllPatients,
    addPatient,
    editPatient,
    deletePatient,
  };
  return { ...actions };
};
