import { FilterState } from "hooks/types/filters";
import api from "./apiClient";

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  searchFields?: string[];
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  filters?: FilterState;
}

interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  filteredRecords: number;
  success: boolean;
  message: string;
  errors: string[];
}

export async function fetchPaginatedData<T>(
  endpoint: string,
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const response = await api.get<PaginatedResponse<T>>(endpoint, {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.search && { search: params.search }),
      ...(params.searchFields && {
        searchFields: params.searchFields.join(","),
      }),
      ...(params.sortColumn && { sortColumn: params.sortColumn }),
      ...(params.sortDirection && { sortDirection: params.sortDirection }),
      ...(params.filters && params.filters),
    },
  });

  return response.data;
}
