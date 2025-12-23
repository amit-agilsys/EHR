import api from "helpers/apiClient";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "slices/auth.slice";
import { ACCOUNT } from "constants/endPoints";
import { useCallback } from "react";
import { toast } from "react-toastify";

const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = useCallback(async () => {
    try {
      await api.get(`${ACCOUNT}/logout`);
      toast.success("Logged out successfully");
    } catch (e) {
      console.log("Failed to logout", e);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  }, [navigate, dispatch]);

  return { handleLogout };
};

export default useLogout;
