// components/FormField/FormField.tsx
import { Label } from "components/ui/label";
import { Input } from "components/ui/input";
import InputMask from "react-input-mask";
import {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  label: string;
  id: Path<T>;
  type?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  className?: string;
  mask?: string;
  watch?: UseFormWatch<T>;
  setValue?: UseFormSetValue<T>;
  required?: boolean;
}

export function FormField<T extends FieldValues>({
  label,
  id,
  type = "text",
  register,
  errors,
  className = "w-1/2",
  mask,
  watch,
  setValue,
  required = true,
}: FormFieldProps<T>) {
  const error = errors[id];

  if (mask && watch && setValue) {
    // For masked inputs, handle the transformation
    const value = (watch(id) as string) || "";

    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Label htmlFor={id} className="text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <InputMask
          mask={mask}
          value={value}
          onChange={(e) => {
            // Remove formatting and save only digits
            const unformatted = e.target.value.replace(/\D/g, "");
            setValue(id, unformatted as T[typeof id], { shouldValidate: true });
          }}
        >
          {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
            <Input
              {...inputProps}
              type={type}
              id={id}
              className={error ? "border border-red-500" : ""}
            />
          )}
        </InputMask>
        {error && (
          <span className="text-sm text-red-500">
            {error.message as string}
          </span>
        )}
      </div>
    );
  }

  // Regular input without mask
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor={id} className="text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        id={id}
        className={error ? "border border-red-500" : ""}
        {...register(id)}
      />
      {error && (
        <span className="text-sm text-red-500">{error.message as string}</span>
      )}
    </div>
  );
}
