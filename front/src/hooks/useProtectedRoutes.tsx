import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "store/store";
import { jwtDecode } from "jwt-decode";
import useLogout from "hooks/useLogout";

const useProtectedRoutes = ({
  element: Component,
}: {
  element: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const { handleLogout } = useLogout();

  const loggedInUser = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, JWT_token } = loggedInUser;

  // check is user is authenticated, if not then logout and navigate to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      handleLogout();
      return;
    }
  }, [isAuthenticated, navigate, handleLogout]);

  // check if token is expired, if yes then logout and navigate to login
  useEffect(() => {
    if (!JWT_token) {
      navigate("/login");
      handleLogout();
      return;
    } else {
      const { exp } = jwtDecode(JWT_token) as { exp: number };
      if (exp < Date.now() / 1000) {
        navigate("/login");
        return;
      }
    }
  }, [navigate, JWT_token, handleLogout]);

  return Component;
};

export default useProtectedRoutes;
