import { useEffect } from "react";
import useLogout from "hooks/useLogout";
import Loader from "./loader/Loader";

function Logout() {
  const { handleLogout } = useLogout();

  useEffect(() => {
    handleLogout();
  }, [handleLogout]);

  return <Loader />;
}

export default Logout;
