import { toast } from "react-toastify";

const useErrorHandler = () => {
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error(
        (error as { response?: { data: { message: string } } }).response?.data
          .message || error.message
      );
    } else {
      toast.error("An unknown error occurred");
    }
  };

  return { handleError };
};

export default useErrorHandler;
