import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useLogout from "hooks/useLogout";
import { LogOut } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "store/store";

// import { useSelector } from "react-redux";

function Dropdown() {
  const userName = useSelector((state: RootState) => state.auth.user?.name);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const { handleLogout } = useLogout();
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-lg font-semibold capitalize text-gray-600">
        {userName}
      </h2>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <img
            className="rounded-full w-11"
            src="/images/user.jpg"
            alt="Profile"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="capitalize">{role}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Dropdown;
