import { Factory } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";

export const SiteLogo = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className={`hover:cursor-pointer ${isCollapsed ? 'justify-center' : ''}`}
          tooltip="TextilePro"
        >
          <Factory className="h-6 w-6" />
          {!isCollapsed && <span className="text-xl font-bold">TextilePro</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
