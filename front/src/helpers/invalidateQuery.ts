import type { QueryClient } from "@tanstack/react-query";

export const invalidateQuery = (
  queryClient: QueryClient,
  queryKey: string | string[]
) => {
  const keyArray = Array.isArray(queryKey) ? queryKey : [queryKey];
  return queryClient.invalidateQueries({ queryKey: keyArray });
};
