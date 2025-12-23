import Input from "components/Input";
import { useState } from "react";
import { LuMail, LuArrowLeft, LuLoader } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { forgotPassword } from "hooks/api/useAuth";
import { toast } from "react-toastify";
import useErrorHandler from "components/useErrorHandler";

export default function ForgotPassword() {
  const { handleError } = useErrorHandler();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Email sent successfully");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div>
      <div className="">
        <h2 className="mb-6 text-gray-500 text-center text-2xl font-bold">
          Forgot Password ?
        </h2>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <p className="mb-6 text-center text-gray-500">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
            <Input
              icon={LuMail}
              type="email"
              placeholder="Email Address"
              {...register("email", { required: true })}
              className={errors.email ? "error-input" : ""}
            />
            <button
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition  my-3"
              type="submit"
            >
              {isSubmitting ? (
                <LuLoader className="mx-auto size-6 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
              <LuMail className="h-8 w-8 text-white" />
            </div>
            <p className="mb-6 text-gray-500">
              If an account exists for {watch("email")}, you will receive a
              password reset link shortly.
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <Link
          to={"/login"}
          className="flex items-center text-sm text-blue-400 hover:underline"
        >
          <LuArrowLeft className="mr-2 h-4 w-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
