// components/FormField/FormField.tsx
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  className?: string;
  required?: boolean;
}

export function FormFiledTime<T extends FieldValues>({
  label,
  id,
  register,
  errors,
  className = "w-1/2",
  required = true,
}: FormFieldProps<T>) {
  const error = errors[id];

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor={id} className="text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type="time"
        id={id}
        step="1"
        defaultValue="10:30:00"
        className={`bg-background block ${error ? "border-red-500" : ""}`}
        {...register(id)}
      />
      {error && (
        <span className="text-sm text-red-500">{error.message as string}</span>
      )}
    </div>
  );
}
