// components/form/AsyncSearchField.tsx
import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SingleValue } from "react-select";
import type { ClassNamesConfig, StylesConfig, GroupBase } from "react-select";
import api from "helpers/apiClient";
import { ApiResponse } from "hooks/types/apiResponse";

interface OptionType {
  value: number;
  label: string;
}

interface AsyncSearchFieldProps {
  onChange: (id: string) => void;
  value?: string | number;
  placeholder?: string;
  apiEndpoint: string;
  minSearchLength?: number;
  defaultOption?: OptionType | null;
  hasError?: boolean;
}

const AsyncSearchField = ({
  onChange,
  placeholder = "Search...",
  apiEndpoint,
  minSearchLength = 2,
  defaultOption,
  hasError = false,
}: AsyncSearchFieldProps) => {
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(
    defaultOption || null
  );

  useEffect(() => {
    if (defaultOption) {
      setSelectedOption(defaultOption);
    }
  }, [defaultOption]);

  const loadOptions = async (inputValue: string): Promise<OptionType[]> => {
    if (!inputValue || inputValue.length < minSearchLength) {
      return [];
    }

    try {
      const response = await api.get<
        ApiResponse<Array<{ id: number; name: string }>>
      >(`${apiEndpoint}?query=${encodeURIComponent(inputValue)}`);

      if (!response.data.success) {
        return [];
      }

      return response.data.data.map((item) => ({
        value: item.id,
        label: item.name,
      }));
    } catch (error) {
      console.error("Error loading options:", error);
      return [];
    }
  };

  const handleChange = (option: SingleValue<OptionType>) => {
    setSelectedOption(option);
    onChange(option ? String(option.value) : "");
  };

  const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    input: (base) => ({
      ...base,
      "input:focus": { boxShadow: "none" },
    }),
    control: (base) => ({
      ...base,
      transition: "none",
    }),
  };

  const customClassNames: ClassNamesConfig<
    OptionType,
    false,
    GroupBase<OptionType>
  > = {
    control: (state) =>
      cn(
        "flex min-h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors hover:cursor-pointer",
        hasError && "border-red-500",
        state.isDisabled && "cursor-not-allowed opacity-50",
        state.isFocused && "outline-none ring-1 ring-ring"
      ),
    placeholder: () => "text-muted-foreground",
    input: () => "text-foreground",
    singleValue: () => "text-foreground",
    menu: () => "mt-1 border bg-popover rounded-md shadow-md z-50",
    menuList: () => "p-1",
    option: (state) =>
      cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        state.isFocused && "bg-accent text-accent-foreground",
        state.isSelected && "bg-accent text-accent-foreground"
      ),
    noOptionsMessage: () => "text-sm text-muted-foreground py-2 text-center",
    loadingMessage: () => "text-sm text-muted-foreground py-2 text-center",
  };

  return (
    <AsyncSelect<OptionType, false>
      cacheOptions
      loadOptions={loadOptions}
      onChange={handleChange}
      value={selectedOption} // Controlled value
      placeholder={placeholder}
      isClearable
      unstyled
      styles={customStyles}
      classNames={customClassNames}
      components={{
        DropdownIndicator: (props) => (
          <components.DropdownIndicator {...props}>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </components.DropdownIndicator>
        ),
        ClearIndicator: (props) => (
          <components.ClearIndicator {...props}>
            <X className="h-4 w-4 opacity-50" />
          </components.ClearIndicator>
        ),
      }}
      loadingMessage={() => "Searching..."}
      noOptionsMessage={({ inputValue }) =>
        inputValue.length < minSearchLength
          ? `Type at least ${minSearchLength} characters`
          : "No results found"
      }
    />
  );
};

export default AsyncSearchField;
