// components/FormField/SelectField.tsx
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import {
  Controller,
  Control,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

interface SelectOption {
  id: string | number;
  name: string;
}

interface SelectFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  options: SelectOption[];
  control: Control<T>;
  errors: FieldErrors<T>;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function SelectField<T extends FieldValues>({
  label,
  id,
  options,
  control,
  errors,
  placeholder = "Select",
  className = "w-1/2",
  required = true,
}: SelectFieldProps<T>) {
  const error = errors[id];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor={String(id)} className="text-gray-600">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Controller
        name={id}
        control={control}
        render={({ field }) => (
          <Select
            onValueChange={field.onChange}
            value={
              field.value !== undefined && field.value !== null
                ? String(field.value)
                : ""
            }
          >
            <SelectTrigger
              className={`focus:ring-0 focus:ring-offset-0 ${
                error ? "border border-red-500" : ""
              }`}
            >
              <SelectValue className="capitalize" placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  <span className="capitalize">{option.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {error && (
        <span className="text-sm text-red-500">{String(error.message)}</span>
      )}
    </div>
  );
}
