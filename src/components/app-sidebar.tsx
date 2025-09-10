import * as React from "react";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  User,
  Settings,
  Box,
  MessagesSquare,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth.store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Users",
      url: "/users",
      icon: User,
    },
    {
      title: "Chats",
      url: "/chat",
      icon: MessagesSquare,
    },
    {
      title: "Workers",
      url: "/workers",
      icon: Frame,
    },
    {
      title: "Production Lines",
      url: "/production-lines",
      icon: Command,
    },
    {
      title: "Assignments",
      url: "/assignments",
      icon: AudioWaveform,
      items: [
        {
          title: "Overview",
          url: "/assignments/overview",
        },
        {
          title: "Calendar",
          url: "/assignments/calendar",
        },
      ],
    },
    {
      title: "Products",
      url: "/products",
      icon: Box,
    },
    {
      title: "Performance",
      url: "/performance",
      icon: GalleryVerticalEnd,
      items: [
        {
          title: "Overview",
          url: "/performance/overview",
        },
        {
          title: "Analytics",
          url: "/performance/analytics",
        },
        {
          title: "AI Insights",
          url: "/performance/ai-insights",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
      items: [
        {
          title: "Account Settings",
          url: "/settings/account",
        },
      ],
    },
  ].filter(Boolean);

  const data = {
    navMain: navItems,
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
