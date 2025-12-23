import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "components/appSidebar/AppSidebar";
import { Outlet } from "react-router-dom";
import Navbar from "components/navbar/Navbar";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar>
        <Navbar />
        <main className="p-3">
          <Outlet />
        </main>
      </AppSidebar>
    </SidebarProvider>
  );
}
