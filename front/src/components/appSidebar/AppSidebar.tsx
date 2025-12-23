import { mainPages, reportsPages, setupPages } from "./pages";
import CollapsibleSection from "./CollapsibleSection";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { useSidebar } from "@/components/ui/sidebar";
import { FaGears } from "react-icons/fa6";
import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LuNotebookText } from "react-icons/lu";
import { usePermission } from "hooks/usePermission ";

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, open, isMobile, state } = useSidebar();
  const { hasPermission } = usePermission();

  const handleDesktopToggle = () => {
    if (!isMobile) {
      toggleSidebar();
    }
  };

  const visibleMainPages = mainPages.filter((page) =>
    hasPermission("View", page.slug)
  );

  const visibleSetupPages = setupPages.filter((page) =>
    hasPermission("View", page.slug)
  );

  const visibleReportPages = reportsPages.filter((page) =>
    hasPermission(page.slug, "Reports")
  );

  return (
    <>
      <Sidebar collapsible="icon">
        {state === "collapsed" && !isMobile && (
          <button
            className="fixed top-3 left-3 z-50 hidden md:block"
            onClick={handleDesktopToggle}
            aria-label="Toggle sidebar on desktop"
          >
            <HiOutlineMenuAlt3 className="h-6 w-6 text-gray-400 cursor-pointer" />
          </button>
        )}
        <SidebarContent>
          {/* Main Pages */}
          {visibleMainPages.length > 0 && (
            <SidebarGroup>
              <div className="flex justify-between items-center px-4 mt-4">
                <SidebarGroupLabel className="text-sm font-medium">
                  <span className="text-gray-400">EHR Reports</span>
                </SidebarGroupLabel>
                <HiOutlineMenuAlt3
                  className="cursor-pointer text-gray-400 h-6 w-6"
                  onClick={toggleSidebar}
                />
              </div>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {visibleMainPages.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          to={item.url}
                          className="flex items-center gap-2 p-2 rounded-md text-sm hover:bg-muted"
                        >
                          <item.icon className="h-4 w-4 text-gray-400" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Reports Section */}
          {visibleReportPages.length > 0 && (
            <SidebarMenu className="space-y-1">
              <CollapsibleSection
                title="Reports"
                items={visibleReportPages}
                icon={LuNotebookText}
                collapsed={!open}
              />
            </SidebarMenu>
          )}

          {/* Setup Section */}
          {visibleSetupPages.length > 0 && (
            <SidebarMenu className="space-y-1">
              <CollapsibleSection
                title="Setup"
                items={visibleSetupPages}
                icon={FaGears}
                collapsed={!open}
              />
            </SidebarMenu>
          )}
        </SidebarContent>
      </Sidebar>
      <main className="flex-1">{children}</main>
    </>
  );
}
