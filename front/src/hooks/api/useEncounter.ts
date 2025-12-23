import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "helpers/apiClient";
import { toast } from "react-toastify";
import { ApiResponse, AxiosError } from "hooks/types/apiResponse";
import {
  CreateEncounter,
  PatientEncounter,
  PatientEncounterList,
} from "hooks/types/patient";
import { invalidateQuery } from "helpers/invalidateQuery";
import { PATIENTS as url } from "constants/endPoints";

export const useGetPatientEncounter = (id?: string | null) => {
  return useQuery<ApiResponse<PatientEncounter[]>, Error>({
    queryKey: ["encounter", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<PatientEncounter[]>>(
        `${url}/GetEncountersByPatientId/${id}`
      );
      if (!data) throw new Error("Failed to fetch encounter");
      return data;
    },
    enabled: id ? true : false,
    retry: false,
  });
};

export const useEncounter = (
  fetchEncounters = false,
  queryKey = "encounter"
) => {
  const queryClient = useQueryClient();

  const getAllEncounters = useQuery<ApiResponse<PatientEncounterList[]>, Error>(
    {
      queryKey: [queryKey],
      queryFn: async () => {
        const { data } = await api.get(`${url}/GetAllEncounters`);
        if (!data) throw new Error("Failed to fetch users");
        return data || [];
      },
      enabled: fetchEncounters,
    }
  );

  const addEncounter = useMutation<
    ApiResponse<CreateEncounter>,
    AxiosError,
    CreateEncounter
  >({
    mutationFn: async (values) => {
      const { data } = await api.post<ApiResponse<CreateEncounter>>(
        `${url}/CreateEncounter`,
        values
      );
      if (!data) throw new Error("Failed to add encounter");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [queryKey]);
      toast.success(data.message);
      return data;
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to add encounter");
    },
  });

  const editEncounter = useMutation<
    ApiResponse<PatientEncounter>,
    AxiosError,
    PatientEncounter
  >({
    mutationFn: async (values) => {
      const { data } = await api.patch<ApiResponse<PatientEncounter>>(
        `${url}/UpdateEncounter`,
        values
      );
      if (!data) throw new Error("Failed to edit encounter");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [queryKey]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to edit encounter");
    },
  });

  const deleteEncounter = useMutation<
    ApiResponse<PatientEncounter>,
    AxiosError,
    number
  >({
    mutationFn: async (id) => {
      const { data } = await api.delete(`${url}/DeleteEncounter/${id}`);
      if (!data) throw new Error("Failed to delete patient");
      return data;
    },
    onSuccess: (data) => {
      invalidateQuery(queryClient, [queryKey]);
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error?.response?.data.message || "Failed to delete patient");
    },
  });

  const actions = {
    getAllEncounters,
    addEncounter,
    editEncounter,
    deleteEncounter,
  };
  return { ...actions };
};
