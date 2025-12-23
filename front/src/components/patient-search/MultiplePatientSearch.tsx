// components/patient-search/PatientSearch.tsx (SIMPLIFIED)
import { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";
import { components } from "react-select";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  ValueContainerProps,
  MultiValue,
  SingleValue,
} from "react-select";
import type { ClassNamesConfig, StylesConfig, GroupBase } from "react-select";
import { PatientOption, PatientSearchItem } from "hooks/types/patient";
import { ApiResponse } from "hooks/types/apiResponse";
import api from "helpers/apiClient";

interface PatientSearchProps {
  onPatientSelect: (patientId: string | string[] | null) => void;
  value: string | string[] | null | undefined;
  mode?: "single" | "multi";
  placeholder?: string;
  styling?: string;
}

const PatientSearch = ({
  onPatientSelect,
  value,
  mode = "single",
  styling = "w-2/12",
  placeholder = "Search patient...",
}: PatientSearchProps) => {
  const [selectedOption, setSelectedOption] = useState<
    PatientOption | PatientOption[] | null
  >(null);

  useEffect(() => {
    if (value === null || value === undefined) {
      setSelectedOption(null);
    }
  }, [value]);

  const loadPatients = async (inputValue: string): Promise<PatientOption[]> => {
    if (!inputValue || inputValue.length < 2) {
      return [];
    }

    try {
      const response = await api.get<ApiResponse<PatientSearchItem[]>>(
        `/Patient/SearchPatientByName?query=${encodeURIComponent(inputValue)}`
      );

      if (!response.data.success) {
        return [];
      }

      return response.data.data.map((patient) => ({
        value: patient.id,
        label: patient.name,
      }));
    } catch (error) {
      console.error("Error loading patients:", error);
      return [];
    }
  };

  const handleSingleChange = (option: SingleValue<PatientOption>) => {
    setSelectedOption(option);
    onPatientSelect(option ? String(option.value) : null);
  };

  const handleMultiChange = (options: MultiValue<PatientOption>) => {
    const optionsArray = Array.from(options);
    setSelectedOption(optionsArray);
    onPatientSelect(
      optionsArray.length > 0
        ? optionsArray.map((opt) => String(opt.value))
        : null
    );
  };

  const customStyles: StylesConfig<
    PatientOption,
    boolean,
    GroupBase<PatientOption>
  > = {
    input: (base) => ({
      ...base,
      "input:focus": { boxShadow: "none" },
    }),
    control: (base) => ({
      ...base,
      transition: "none",
      minHeight: "36px",
      height: "36px",
    }),
    valueContainer: (base) => ({
      ...base,
      height: "36px",
      padding: "0 8px",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: "36px",
    }),
  };

  const customClassNames: ClassNamesConfig<
    PatientOption,
    boolean,
    GroupBase<PatientOption>
  > = {
    control: (state) =>
      cn(
        "flex max-h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors hover:cursor-pointer",
        state.isDisabled && "cursor-not-allowed opacity-50",
        state.isFocused && "outline-none ring-1 ring-ring"
      ),
    placeholder: () => "text-muted-foreground",
    input: () => "text-foreground",
    singleValue: () => "text-foreground",
    valueContainer: () => "gap-1 flex flex-wrap",
    multiValue: () =>
      "bg-secondary text-secondary-foreground rounded-sm px-1.5 py-0.5 gap-1",
    multiValueLabel: () => "text-sm",
    multiValueRemove: () => "hover:bg-secondary-foreground/20 rounded-sm",
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

  const CustomValueContainer = ({
    children,
    ...props
  }: ValueContainerProps<PatientOption, true, GroupBase<PatientOption>>) => {
    const { getValue, hasValue } = props;
    const values = getValue();

    if (!hasValue) {
      return (
        <components.ValueContainer {...props}>
          {children}
        </components.ValueContainer>
      );
    }

    if (values.length > 1) {
      return (
        <components.ValueContainer {...props}>
          <div className="text-sm text-foreground">
            {values.length} Selected
          </div>
          {Array.isArray(children) ? children[1] : null}
        </components.ValueContainer>
      );
    }

    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  };

  if (mode === "multi") {
    const selectedValues = Array.isArray(selectedOption) ? selectedOption : [];

    return (
      <div className={styling}>
        <AsyncSelect<PatientOption, true>
          isMulti
          cacheOptions
          loadOptions={loadPatients}
          onChange={handleMultiChange}
          value={selectedValues}
          placeholder={placeholder}
          isClearable
          hideSelectedOptions={false}
          closeMenuOnSelect={false}
          unstyled
          blurInputOnSelect={true}
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
            ValueContainer: CustomValueContainer,
          }}
          loadingMessage={() => "Searching..."}
          noOptionsMessage={({ inputValue }) =>
            inputValue.length < 2
              ? "Type at least 2 characters"
              : "No patients found"
          }
        />
      </div>
    );
  }

  return (
    <div className={styling}>
      <AsyncSelect<PatientOption, false>
        cacheOptions
        loadOptions={loadPatients}
        onChange={handleSingleChange}
        value={selectedOption as PatientOption | null}
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
          inputValue.length < 2
            ? "Type at least 2 characters"
            : "No patients found"
        }
      />
    </div>
  );
};

export default PatientSearch;
