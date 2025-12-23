import { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { fetchPaginatedData } from "helpers/api.service";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchBar } from "./search/SearchBar";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Loader from "./loader/Loader";
import NoDataFound from "./NoDataFound";
import { FilterState, FilterValue } from "hooks/types/filters";
import { toast } from "react-toastify";
import api from "helpers/apiClient";
import { format } from "date-fns";
import { AxiosError } from "hooks/types/apiResponse";

const PAGESIZE = [5, 10, 15, 20, 50];

interface PaginatedDataTableProps<TData> {
  columns: ColumnDef<TData>[];
  endpoint: string;
  queryKey: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  defaultPageSize?: number;
  enableSearch?: boolean;
  defaultSortColumn: string;
  defaultSortDirection: "asc" | "desc";
  pdfDownloadEndpoint?: string | null;
  defaultFilterValues?: Partial<FilterState>;
}

export function PaginatedDataTable<TData>({
  columns,
  endpoint,
  queryKey,
  searchPlaceholder,
  searchFields = [],
  defaultPageSize = 15,
  enableSearch = true,
  defaultSortColumn = "name",
  defaultSortDirection = "asc",
  pdfDownloadEndpoint = null,
  defaultFilterValues = {},
}: PaginatedDataTableProps<TData>) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const normalizedDefaults = useMemo(() => {
    const normalized: Partial<FilterState> = {};

    Object.entries(defaultFilterValues).forEach(([key, value]) => {
      if (value instanceof Date) {
        normalized[key] = format(value, "yyyy-MM-dd");
      } else if (
        value &&
        typeof value === "object" &&
        "from" in value &&
        "to" in value
      ) {
        // Handle date ranges - store as separate from/to fields
        const rangeKey = key as string;
        if (rangeKey === "admitDateRange") {
          normalized["admitStartDate"] = format(value.from, "MM-dd-yyyy");
          normalized["admitEndDate"] = format(value.to, "MM-dd-yyyy");
        } else if (rangeKey === "dischargeDateRange") {
          normalized["dischargeStartDate"] = format(value.from, "MM-dd-yyyy");
          normalized["dischargeEndDate"] = format(value.to, "MM-dd-yyyy");
        } else if (rangeKey === "startEndDateRange") {
          normalized["startDate"] = format(value.from, "MM-dd-yyyy");
          normalized["endDate"] = format(value.to, "MM-dd-yyyy");
        }
      } else {
        normalized[key] = value;
      }
    });

    return normalized;
  }, [defaultFilterValues]);

  const [filters, setFilters] = useState<FilterState>(
    normalizedDefaults as FilterState
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: defaultSortColumn,
      desc: defaultSortDirection === "desc",
    },
  ]);

  const handleFilterChange = (key: string, value: FilterValue) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      queryKey,
      pagination.pageIndex + 1,
      pagination.pageSize,
      debouncedSearch,
      filters,
      sorting,
    ],
    queryFn: () =>
      fetchPaginatedData<TData>(endpoint, {
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search: debouncedSearch || undefined,
        // searchFields: searchFields.length > 0 ? searchFields : undefined,
        sortColumn: sorting.length > 0 ? sorting[0].id : undefined,
        sortDirection:
          sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
        filters,
      }),
    placeholderData: keepPreviousData,
  });

  const handlePdfDownload = async () => {
    if (!pdfDownloadEndpoint) {
      toast.error("PDF download endpoint not configured");
      return;
    }
    setIsDownloading(true);
    try {
      const response = await api.get(pdfDownloadEndpoint, {
        params: {
          search: debouncedSearch || undefined,
          sortColumn: sorting.length > 0 ? sorting[0].id : undefined,
          sortDirection:
            sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined,
          ...filters,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success("PDF opened in new tab");
    } catch (error) {
      const err = error as AxiosError;
      toast.error(err?.response?.data.message || "Failed to open PDF");
      console.error("PDF download error", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const totalPages = data?.filteredRecords
    ? Math.ceil(data.filteredRecords / pagination.pageSize)
    : 0;

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    pageCount: totalPages,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
  });

  if (isError) {
    return (
      <div className="text-center p-4 text-red-500">
        Error: {error instanceof Error ? error.message : "Failed to load data"}
      </div>
    );
  }

  const handleSearch = (value: string) => {
    if (searchPlaceholder === "Admit Number") {
      if (value && !!/^\d+$/.test(value)) {
        setSearchError(null);
      }
      if (value && !/^\d+$/.test(value)) {
        setSearchError("Admit number must be a number");
        return;
      }
    }

    setSearch(value);
  };

  if (isLoading) return <Loader />;

  return (
    <div className="mt-4 pt-4 border border-gray-200 rounded-md bg-white">
      <div className="px-4">
        {enableSearch && (
          <div className="flex justify-between items-center">
            <SearchBar
              value={search}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              searchFields={searchFields}
              filters={filters}
              error={searchError}
              onFilterChange={handleFilterChange}
              defaultFilterValues={defaultFilterValues}
            />

            {/* Conditional PDF Download Button */}
            {pdfDownloadEndpoint && (
              <Button
                size="sm"
                onClick={handlePdfDownload}
                disabled={isDownloading || !data || data.filteredRecords === 0}
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="w-full mt-4 bg-white rounded-md border">
        <div className="h-[70vh] overflow-y-auto">
          <Table className="w-full table-auto">
            <TableHeader className="bg-white">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  className="bg-muted/50 hover:bg-muted/50"
                  key={headerGroup.id}
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      className="font-semibold h-12 text-gray-600 px-4 sticky top-0 bg-gray-100"
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex items-center cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="ml-2">
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="h-4 w-4" />
                              ) : (
                                <ArrowUpDown className="h-4 w-4 opacity-50" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell className="capitalize" key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <NoDataFound />
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between p-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {data && data.filteredRecords > 0 ? (
            <>
              Showing{" "}
              <span className="">
                {pagination.pageIndex * pagination.pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="">
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  data.filteredRecords
                )}
              </span>{" "}
              of <span className=" ">{data.filteredRecords}</span> results
              {data.filteredRecords !== data.totalRecords && (
                <span className="text-xs ml-1">
                  (filtered from {data.totalRecords} total)
                </span>
              )}
            </>
          ) : (
            "No results"
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex gap-2">
            <p className="text-base text-gray-500">Rows per page</p>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) =>
                setPagination({
                  pageIndex: 0,
                  pageSize: Number(value),
                })
              }
            >
              <SelectTrigger className="h-8 w-[60px] px-2 bg-white focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder={pagination.pageSize.toString()} />
              </SelectTrigger>

              {/* Make dropdown the same width */}
              <SelectContent className="w-[60px]">
                {PAGESIZE.map((pageSize) => (
                  <SelectItem
                    key={pageSize}
                    value={String(pageSize)}
                    className="text-center" // optional for nicer alignment
                  >
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.pageIndex + 1} of {totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>«
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>‹
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>›
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  pageIndex: totalPages - 1,
                }))
              }
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>»
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
