import { useQuery } from "@tanstack/react-query";
import { SCREEN } from "constants/endPoints";
import api from "helpers/apiClient";
import { ApiResponse } from "hooks/types/apiResponse";
import { Screen } from "hooks/types/screen";

export const useScreens = (fetchScreens = false) => {
  const url = SCREEN;

  const getAllScreens = useQuery<Screen[], Error>({
    queryKey: [url, "all"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Screen[]>>(
        `${url}/GetAllScreens`
      );
      if (!data.success)
        throw new Error(data.message || "Failed to fetch users");

      return data.data; // return only screens[]
    },
    staleTime: 1000 * 60 * 10,
    enabled: fetchScreens,
  });

  return { getAllScreens };
};
