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
  Logs,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/auth.store";
import { useTranslation } from "react-i18next";
import { SiteLogo } from "./SiteLogo";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();
  const { t } = useTranslation(['sidebar']);


  const navItems = [
  {
    title: t('nav.dashboard'),
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: t('nav.users'),
    url: "/users",
    icon: User,
  },
  {
    title: t('nav.chats'),
    url: "/chat",
    icon: MessagesSquare,
  },
  {
    title: t('nav.workers'),
    url: "/workers",
    icon: Frame,
  },
  {
    title: t('nav.productionLines'),
    url: "/production-lines",
    icon: Command,
  },
  {
    title: t('nav.assignments.title'),
    url: "/assignments",
    icon: AudioWaveform,
    items: [
      {
        title: t('nav.assignments.overview'),
        url: "/assignments/overview",
      },
      {
        title: t('nav.assignments.calendar'),
        url: "/assignments/calendar",
      },
    ],
  },
  {
    title: t('nav.products'),
    url: "/products",
    icon: Box,
  },
  {
    title: t('nav.performance.title'),
    url: "/performance",
    icon: GalleryVerticalEnd,
    items: [
      {
        title: t('nav.performance.overview'),
        url: "/performance/overview",
      },
      {
        title: t('nav.performance.analytics'),
        url: "/performance/analytics",
      },
      {
        title: t('nav.performance.aiInsights'),
        url: "/performance/ai-insights",
      },
    ],
  },
  {
    title: t('nav.auditLogs.title'),
    url: "/settings/audit-logs",
    icon: Logs,
    items: [
      {
        title: t('nav.auditLogs.overview'),
        url: "/settings/audit-logs",
      },
      {
        title: t('nav.auditLogs.stats'),
        url: "/settings/audit-stats",
      },
    ],
  },
  {
    title: t('nav.accountSettings'),
    url: "/settings/account",
    icon: Settings,
  },
].filter(Boolean);

  const data = {
    navMain: navItems,
  };

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SiteLogo/>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
      <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
