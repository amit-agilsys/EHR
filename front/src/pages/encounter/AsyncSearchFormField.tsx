// components/form/AsyncSearchFormField.tsx
import {
  Control,
  FieldErrors,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import { Label } from "components/ui/label";
import AsyncSearchField from "components/patient-search/AsyncSearchField";

interface AsyncSearchFormFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  control: Control<T>;
  errors: FieldErrors<T>;
  placeholder?: string;
  apiEndpoint: string;
  minSearchLength?: number;
  defaultOption?: { value: number; label: string } | null;
  required?: boolean;
}

export function AsyncSearchFormField<T extends FieldValues>({
  label,
  id,
  control,
  errors,
  placeholder = "Search...",
  apiEndpoint,
  minSearchLength = 2,
  defaultOption,
  required = true,
}: AsyncSearchFormFieldProps<T>) {
  const hasError = !!errors[id];
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Controller
        name={id}
        control={control}
        render={(
          { field: { onChange } } // Add value here
        ) => (
          <AsyncSearchField
            onChange={onChange}
            // value={value} // Pass the field value
            placeholder={placeholder}
            apiEndpoint={apiEndpoint}
            minSearchLength={minSearchLength}
            defaultOption={defaultOption}
            hasError={hasError}
          />
        )}
      />
      {errors[id] && (
        <p className="text-sm text-red-500">{errors[id]?.message as string}</p>
      )}
    </div>
  );
}
