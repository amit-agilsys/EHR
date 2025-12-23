import { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "store/store";
import { logout } from "slices/auth.slice";
import { useRedirectUrl } from "hooks/useRedirectUrl";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
// import AccessDenied from "pages/AccessDenied";
import { usePermission } from "hooks/usePermission ";
import AccessDenied from "./AccessDenied";

interface ProtectedRouteProps {
  element: React.ReactNode;
}

export function ProtectedRoute({ element }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated, JWT_token, permissions } = useSelector(
    (state: RootState) => state.auth
  );
  const { hasPermission } = usePermission();
  const redirectUrl = useRedirectUrl();

  // Check JWT token validity
  useEffect(() => {
    if (location.pathname === "/logout") return;

    if (!isAuthenticated || !JWT_token || !permissions) {
      navigate("/login");
      return;
    }

    // Check if token is expired
    try {
      const { exp } = jwtDecode<{ exp: number }>(JWT_token);
      if (exp < Date.now() / 1000) {
        toast.warning("Session expired, please login again");
        dispatch(logout());
        navigate("/login");
        return;
      }
    } catch (error) {
      console.error("Invalid token:", error);
      dispatch(logout());
      navigate("/login");
      return;
    }
  }, [
    isAuthenticated,
    dispatch,
    navigate,
    JWT_token,
    location.pathname,
    permissions,
  ]);

  if (!isAuthenticated) {
    return null;
  }

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const basePath = pathSegments[0];

  let screenName = "";
  let actionName = "View";

  if (!basePath) {
    return <Navigate to="/login" replace />;
  }

  if (basePath === "reports" && pathSegments.length > 1) {
    screenName = "Reports";
    actionName = pathSegments[1].toLowerCase();
  } else {
    screenName = basePath.toLowerCase();
  }

  const hasAccess = hasPermission(actionName, screenName);

  if (!hasAccess) {
    toast.warning("You don't have permission to access this page!");
    return <AccessDenied redirectUrl={redirectUrl} />;
  }

  return <>{element}</>;
}

export default ProtectedRoute;
