import { HiMiniBars3BottomRight } from "react-icons/hi2";
import Breadcrumb from "components/Breadcrumb";
import Dropdown from "./Dropdown";
import { useSidebar } from "@/components/ui/sidebar";

function Navbar() {
  const { openMobile, setOpenMobile, isMobile } = useSidebar();

  const handleMobileToggle = () => {
    if (isMobile) {
      setOpenMobile(!openMobile);
    }
  };

  return (
    <div className="relative border border-b-gray-200 bg-white py-4">
      {!openMobile && (
        <button
          onClick={handleMobileToggle}
          className="absolute left-2 top-2 z-50 md:hidden"
          aria-label="Toggle sidebar on mobile"
        >
          <HiMiniBars3BottomRight className="text-2xl text-green-500" />
        </button>
      )}

      <nav className="flex justify-between px-4">
        <Breadcrumb />
        <Dropdown />
      </nav>
    </div>
  );
}

export default Navbar;
