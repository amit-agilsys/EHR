import Input from "components/Input";
import { resetPassword } from "hooks/api/useAuth";
import { useForm } from "react-hook-form";
import { LuArrowLeft, LuLock } from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useErrorHandler from "components/useErrorHandler";
import PasswordStrengthMeter from "components/PasswordStrengthMeter";
import { PasswordFormValues, passwordSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";

type resetPassword = {
  password: string;
  confirmPassword: string;
};

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const { handleError } = useErrorHandler();
  const token = queryParams.get("token");
  const email = queryParams.get("email");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: resetPassword) => {
    if (!token || !email) {
      toast.error("Invalid token or email");
      return;
    }
    try {
      const response = await resetPassword({
        token,
        password: data.password,
        email,
      });

      if (!response.success) {
        toast.error(response.errors[0]);
        return;
      }
      toast.success("Password reset successfully");
      navigate("/login");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <>
      <div className="">
        <h2 className="mb-6 text-gray-500 text-center text-2xl font-bold">
          {location.pathname.includes("/reset-password") ? "Reset" : "Set"}{" "}
          Password
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            icon={LuLock}
            type="password"
            placeholder="New Password"
            {...register("password", { required: "New password is required" })}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}

          <Input
            icon={LuLock}
            type="password"
            placeholder="Confirm New Password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            className={`mt-2 ${errors.confirmPassword ? "error-input" : ""}`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}

          <PasswordStrengthMeter password={watch("password") || ""} />

          <button
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition my-3"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Set New Password"}
          </button>
        </form>
      </div>
      <div className="flex justify-center ">
        <Link
          to={"/login"}
          className="flex items-center text-sm text-blue-400 hover:underline"
        >
          <LuArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Link>
      </div>
    </>
  );
};

export default ResetPassword;
