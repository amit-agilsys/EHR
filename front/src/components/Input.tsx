import { forwardRef, InputHTMLAttributes, ComponentType } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<{ className?: string }>;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon: Icon, ...props }, ref) => {
    return (
      <div className="relative mb-1">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Icon className="size-5 text-blue-500" />
        </div>
        <input
          {...props}
          ref={ref}
          className={`w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:border-gray-500 outline-none text-sm text-gray-800 placeholder-gray-400 ${props.className}`}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
