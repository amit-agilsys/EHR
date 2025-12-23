// components/SearchBar.tsx
import { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { FilterState, FilterValue } from "hooks/types/filters";
import { FinancialClass } from "hooks/types/financialClass";
import { useLists } from "hooks/api/useList";
import { RoleList } from "hooks/types/role";
import { Input } from "@/components/ui/input";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { DatePicker } from "../DatePicker";
import { roleStatus, statusOptions } from "./list";
import { RootState } from "store/store";
import { PatientType } from "hooks/types/PatientType";
import { RoomType } from "hooks/types/roomType";
import { Button } from "components/ui/button";
import MultiplePatientSearch from "components/patient-search/MultiplePatientSearch";
import { DateRangeFilter } from "./DateRangeFilter";
import { isValid, parseISO } from "date-fns";

// const MAX_DISPLAY_COUNT = 5;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchFields?: string[];
  filters: FilterState;
  onFilterChange: (key: string, value: FilterValue) => void;
  error?: string | null;
  defaultFilterValues?: Partial<FilterState>;
}

interface FilterConfig {
  key: string;
  title: string;
  searchField: string;
  mode: "single" | "multi";
  searchable: boolean;
  searchPlaceholder: string;
}

interface DateFilterConfig {
  key: string;
  searchField: string;
  placeholder: string;
  minDate?: Date;
  maxDate?: Date;
  defaultValue?: Date | null;
}

interface DateRangeFilterConfig {
  key: string;
  fromField: string;
  toField: string;
  title: string;
  minDate?: Date;
  maxDate?: Date;
  defaultValue?: { from: Date; to: Date } | null;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  searchFields = [],
  filters,
  onFilterChange,
  error,
  defaultFilterValues = {},
}: SearchBarProps) {
  // Fetch lists
  const { getDoctorsList, getRoleList } = useLists({
    fetchDoctors: true,
    fetchRoles: true,
  });

  const { patientType, roomType, gender, financialClass } = useSelector(
    (state: RootState) => state.list
  );

  // const getDefaultValueForField = useCallback(
  //   (field: string) => {
  //     return defaultFilterValues[field];
  //   },
  //   [defaultFilterValues] // dependencies
  // );

  // Memoized list transformations
  const lists = useMemo(() => {
    return {
      role:
        getRoleList.data?.data
          ?.map((r: RoleList) => ({
            value: String(r.roleId),
            label: r.roleName,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)) || [],
      gender:
        gender
          .map((g) => ({ value: String(g.id), label: g.name }))
          .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
      financialClass:
        financialClass.map((fc: FinancialClass) => ({
          value: String(fc.id),
          label: fc.name,
        })) ?? [],
      doctor:
        getDoctorsList.data?.data?.map((d) => ({
          value: String(d.id),
          label: d.name,
        })) ?? [],
      patientType:
        patientType.map((loc: PatientType) => ({
          value: String(loc.id),
          label: loc.name,
        })) ?? [],
      roomType:
        roomType.map((rt: RoomType) => ({
          value: String(rt.id),
          label: rt.name,
        })) ?? [],
      status: statusOptions,
      roleStatus: roleStatus,
    };
  }, [
    getRoleList.data?.data,
    getDoctorsList.data?.data,
    gender,
    financialClass,
    patientType,
    roomType,
  ]);

  const convertToDate = (value: FilterValue): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = parseISO(value);
      return isValid(parsed) ? parsed : null;
    }
    return null;
  };

  const convertToDateRange = (
    value: FilterValue
  ): { from: Date; to: Date } | null => {
    if (!value || typeof value !== "object") return null;
    if ("from" in value && "to" in value) {
      const from =
        value.from instanceof Date
          ? value.from
          : parseISO(value.from as string);
      const to =
        value.to instanceof Date ? value.to : parseISO(value.to as string);
      if (isValid(from) && isValid(to)) {
        return { from, to };
      }
    }
    return null;
  };

  // Update the getDefaultValueForField to be type-safe
  const getDefaultDateValue = useCallback(
    (field: string): Date | null => {
      const value = defaultFilterValues[field];
      return convertToDate(value);
    },
    [defaultFilterValues]
  );

  const getDefaultDateRangeValue = useCallback(
    (field: string): { from: Date; to: Date } | null => {
      const value = defaultFilterValues[field];
      return convertToDateRange(value);
    },
    [defaultFilterValues]
  );

  // Create Maps for O(1) lookup instead of O(n) array.find()
  const filterConfigMap = useMemo(() => {
    const filterConfigs: FilterConfig[] = [
      {
        key: "role",
        title: "Role",
        searchField: "role",
        mode: "single",
        searchable: false,
        searchPlaceholder: "Select roles",
      },
      {
        key: "emailConfirmed",
        title: "Status",
        searchField: "emailConfirmed",
        mode: "single",
        searchable: false,
        searchPlaceholder: "Select status",
      },
      {
        key: "roleStatus",
        title: "Status",
        searchField: "roleStatus",
        mode: "single",
        searchable: false,
        searchPlaceholder: "Select status",
      },
      {
        key: "gender",
        title: "Gender",
        searchField: "gender",
        mode: "single",
        searchable: false,
        searchPlaceholder: "Select gender",
      },
      {
        key: "financialClassId",
        title: "FC",
        searchField: "financialClassId",
        mode: "multi",
        searchable: true,
        searchPlaceholder: "Search financial class...",
      },
      {
        key: "doctorId",
        title: "Doctor",
        searchField: "doctorId",
        mode: "multi",
        searchable: true,
        searchPlaceholder: "Search doctors...",
      },
      {
        key: "patientTypeId",
        title: "Care",
        searchField: "patientTypeId",
        mode: "multi",
        searchable: true,
        searchPlaceholder: "Search Patient Type...",
      },
      {
        key: "roomTypeId",
        title: "Room Type",
        searchField: "roomTypeId",
        mode: "multi",
        searchable: true,
        searchPlaceholder: "Search room type...",
      },
    ];

    return new Map(filterConfigs.map((config) => [config.searchField, config]));
  }, []);

  const dateFilterConfigMap = useMemo(() => {
    const dateFilterConfigs: DateFilterConfig[] = [
      {
        key: "admitDate",
        searchField: "admitDate",
        placeholder: "Admit",
        maxDate: new Date(),
        defaultValue: getDefaultDateValue("admitDate"),
      },
      {
        key: "startDate",
        searchField: "startDate",
        placeholder: "Start Date",
        maxDate: new Date(),
        defaultValue: getDefaultDateValue("startDate"),
      },
      {
        key: "endDate",
        searchField: "endDate",
        placeholder: "End Date",
        maxDate: new Date(),
        defaultValue: getDefaultDateValue("endDate"),
      },
      {
        key: "dob",
        searchField: "dob",
        placeholder: "DOB",
        maxDate: new Date(),
        defaultValue: getDefaultDateValue("dob"),
      },
      {
        key: "reportDate",
        searchField: "date",
        placeholder: "Select date",
        maxDate: new Date(),
        defaultValue: getDefaultDateValue("reportDate"),
      },
      {
        key: "dischargeDate",
        searchField: "dischargeDate",
        placeholder: "Discharge",
        minDate: filters.admitDate
          ? new Date(filters.admitDate as string)
          : undefined,
        maxDate: new Date(),
        defaultValue: getDefaultDateValue("dischargeDate"),
      },
    ];

    return new Map(
      dateFilterConfigs.map((config) => [config.searchField, config])
    );
  }, [filters.admitDate, getDefaultDateValue]);

  const dateRangeFilterConfigMap = useMemo(() => {
    const dateRangeConfigs: DateRangeFilterConfig[] = [
      {
        key: "admitDateRange",
        fromField: "admitStartDate",
        toField: "admitEndDate",
        title: "Admit",
        maxDate: new Date(),
        defaultValue: getDefaultDateRangeValue("admitDateRange"),
      },
      {
        key: "dischargeDateRange",
        fromField: "dischargeStartDate",
        toField: "dischargeEndDate",
        title: "Discharge",
        minDate: filters.admitDate
          ? new Date(filters.admitDate as string)
          : undefined,
        maxDate: new Date(),
        defaultValue: getDefaultDateRangeValue("dischargeDateRange"),
      },
      {
        key: "startEndDateRange",
        fromField: "startDate",
        toField: "endDate",
        title: "Admit – Discharge Date",
        maxDate: new Date(),
        defaultValue: getDefaultDateRangeValue("startEndDateRange"),
      },
    ];

    return new Map(dateRangeConfigs.map((config) => [config.key, config]));
  }, [filters.admitDate, getDefaultDateRangeValue]);

  const isDateRangeField = (field: string): boolean => {
    return dateRangeFilterConfigMap.has(field);
  };

  // Helper functions remain the same
  const getSelectedValues = (key: string): string[] => {
    const filterValue = filters[key];
    if (!filterValue) return [];
    return Array.isArray(filterValue)
      ? filterValue.map(String)
      : [String(filterValue)];
  };

  const getOptions = (key: string) => {
    const mappedKey =
      key === "emailConfirmed"
        ? "status"
        : key === "roleStatus"
        ? "roleStatus"
        : key === "gender"
        ? "gender"
        : key === "doctorId"
        ? "doctor"
        : key === "patientTypeId"
        ? "patientType"
        : key === "financialClassId"
        ? "financialClass"
        : key === "roomTypeId"
        ? "roomType"
        : key;
    return lists[mappedKey as keyof typeof lists] || [];
  };

  const hasActiveFilters = useMemo(() => {
    const hasSearchText = value.trim().length > 0;
    const hasFilters = Object.values(filters).some(
      (filterValue) =>
        filterValue !== null &&
        filterValue !== undefined &&
        (Array.isArray(filterValue) ? filterValue.length > 0 : true)
    );

    return hasSearchText || hasFilters;
  }, [value, filters]);

  const resetFilters = () => {
    onChange("");
    onFilterChange("patientId", null);
    filterConfigMap.forEach((config) => {
      onFilterChange(config.key, null);
    });
    dateFilterConfigMap.forEach((config) => {
      onFilterChange(config.key, null);
    });
    dateRangeFilterConfigMap.forEach((config) => {
      onFilterChange(config.fromField, null);
      onFilterChange(config.toField, null);
    });
  };

  const getPatientValue = (
    value: FilterValue
  ): string | string[] | null | undefined => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      return value.every((v) => typeof v === "string")
        ? (value as string[])
        : null;
    }
    if (typeof value === "number") return String(value);
    return null;
  };

  // Render helper using Map.get() - O(1) lookup
  const renderFilter = (field: string) => {
    if (field === "patientId") {
      return (
        <div className="min-w-52">
          <MultiplePatientSearch
            key="patientId"
            onPatientSelect={(ids) => onFilterChange("patientId", ids)}
            value={getPatientValue(filters.patientId)}
            mode="multi"
            styling="w-full"
          />
        </div>
      );
    }

    if (isDateRangeField(field)) {
      const config = dateRangeFilterConfigMap.get(field)!;
      return (
        <div className="">
          <DateRangeFilter
            key={config.key}
            title={config.title}
            fromField={config.fromField}
            toField={config.toField}
            fromValue={filters[config.fromField] as string | null | undefined}
            toValue={filters[config.toField] as string | null | undefined}
            onFromChange={(date) => onFilterChange(config.fromField, date)}
            onToChange={(date) => onFilterChange(config.toField, date)}
            minDate={config.minDate}
            maxDate={config.maxDate}
            defaultValue={config.defaultValue}
          />
        </div>
      );
    }

    // O(1) lookup for date config
    const dateConfig = dateFilterConfigMap.get(field);
    if (dateConfig) {
      return (
        <DatePicker
          key={dateConfig.key}
          value={filters[dateConfig.key] as string | null | undefined}
          onChange={(date) => onFilterChange(dateConfig.key, date)}
          placeholder={dateConfig.placeholder}
          minDate={dateConfig.minDate}
          maxDate={dateConfig.maxDate}
          defaultValue={dateConfig.defaultValue}
        />
      );
    }

    // O(1) lookup for filter config
    const filterConfig = filterConfigMap.get(field);
    if (filterConfig) {
      return (
        <MultiSelectFilter
          key={filterConfig.key}
          title={filterConfig.title}
          options={getOptions(filterConfig.key)}
          selectedValues={getSelectedValues(filterConfig.key)}
          onChange={(values) => {
            onFilterChange(
              filterConfig.key,
              values.length > 0
                ? filterConfig.mode === "single"
                  ? values[0]
                  : values
                : null
            );
          }}
          searchable={filterConfig.searchable}
          searchPlaceholder={filterConfig.searchPlaceholder}
          mode={filterConfig.mode}
          // maxDisplayCount={MAX_DISPLAY_COUNT}
          maxDisplayCount={field.length}
        />
      );
    }

    return null;
  };

  return (
    <div className="flex bg-white gap-1 w-full">
      <div className="flex flex-col">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`pl-2 ${error ? "border-red-500" : ""}`}
        />
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>

      {searchFields &&
        searchFields.map((field) => (
          <div key={field}>{renderFilter(field)}</div>
        ))}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-gray-600 hover:text-gray-900 h-9"
        >
          Reset
          <X className="ml-1 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
