import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "components/ui/sidebar";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface CollapsibleSectionProps {
  title: string;
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  icon?: React.ComponentType<{ className?: string }>;
  collapsed?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  items,
  icon: Icon,
  collapsed,
}) => {
  if (collapsed) {
    return (
      <SidebarGroup className="p-0 pb-1">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="justify-center py-3">
              {Icon && <Icon className="h-5 w-5 ml-3 text-gray-400" />}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }
  return (
    <Collapsible className="group/collapsible overflow-hidden">
      <SidebarGroup className="p-0 pb-1">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex items-center mx-2 py-2 text-sm font-medium hover:bg-muted text-white hover:text-gray-700">
            {Icon && <Icon className="mr-2 h-4 w-4 text-gray-400" />}
            <span className="text-sm">{title}</span>
            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180 text-gray-400" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>

        <CollapsibleContent>
          <SidebarGroupContent className="px-1 mt-2">
            <SidebarMenu className="space-y-1 ms-3 mt-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title} className="mr-4">
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
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
};

export default CollapsibleSection;
