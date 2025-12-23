import { LuLoader, LuLock, LuMail } from "react-icons/lu";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import Input from "components/Input";
import { User } from "hooks/types/auth";
import { loginUser } from "hooks/api/useAuth";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "slices/auth.slice";
import useErrorHandler from "components/useErrorHandler";
import { loginSchema, LoginSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { RootState } from "store/store";
import { useEffect } from "react";

export default function Login() {
  const { handleError } = useErrorHandler();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { JWT_token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (JWT_token && isAuthenticated) navigate("/encounters");
  }, [JWT_token, isAuthenticated, navigate]);

  const onSubmit = async (data: User) => {
    try {
      const result = await loginUser(data);
      if (result.data) {
        const { user } = result.data;
        const newUser = {
          id: user.id || "",
          name: user.name,
          email: user.email,
          role: user.role || "",
        };
        dispatch(
          setUser({
            user: newUser,
            JWT_token: result.data.accessToken,
            permissions: result.data.user.permissions,
          })
        );
      }
      if (result.success) navigate("/encounters");
      toast.success(result.message || "Login successful");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="">
      <h2 className="text-lg font-semibold text-gray-600 mb-1 text-center">
        Welcome Back!
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Please sign-in to your account to check reports
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-2">
          <label
            className="block text-sm font-medium text-gray-700 mb-1"
            htmlFor="email"
          >
            Email or Username
          </label>
          <Input
            icon={LuMail}
            type="email"
            id="email"
            placeholder="Email address"
            {...register("email", {
              required: "Email is required",
            })}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center">
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-500 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            icon={LuLock}
            id="password"
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          {isSubmitting ? (
            <LuLoader className="mx-auto h-6 w-6 animate-spin" />
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
