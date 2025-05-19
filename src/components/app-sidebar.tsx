import * as React from "react"
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Team 1",
      logo: GalleryVerticalEnd,
      plan: "production line 1",
    },
    {
      name: "Team 2",
      logo: AudioWaveform,
      plan: "production line 2",
    },
    {
      name: "Team 3",
      logo: Command,
      plan: "production line 3",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,  // Active by default
    },
    {
      title: "Production Lines",
      url: "/production-lines",
      icon: Command,
      items: [
        {
          title: "Line Overview",
          url: "/production-lines",
        },
        {
          title: "Worker Assignment",
          url: "/production-lines/assignment",
        },
        {
          title: "Line Analytics",
          url: "/production-lines/analytics",
        }
      ],
    },
    {
      title: "Workers",
      url: "/workers",
      icon: Frame,
      items: [
        {
          title: "All Workers",
          url: "/workers/list",
        },
        {
          title: "Performance Records",
          url: "/workers/performance",
        },
        {
          title: "Skill Matrix",
          url: "/workers/skills",
        },
      ],
    },
    {
      title: "Data Entry",
      url: "/data-entry",
      icon: AudioWaveform,
      items: [
        {
          title: "Manual Entry",
          url: "/data-entry/manual",
        },
        {
          title: "Excel Import",
          url: "/data-entry/import",
        },
        {
          title: "Historical Data",
          url: "/data-entry/history",
        },
      ],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: PieChart,
      items: [
        {
          title: "Efficiency Reports",
          url: "/reports/efficiency",
        },
        {
          title: "Production Analysis",
          url: "/reports/production",
        },
        {
          title: "Worker Performance",
          url: "/reports/performance",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "User Management",
          url: "/settings/users",
        },
        {
          title: "Line Configuration",
          url: "/settings/lines",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} isPartOfHeader={false} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
