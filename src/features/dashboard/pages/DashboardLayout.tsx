import { AppSidebar } from "@/components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { ColorThemeSwitcher } from "@/components/theme/ColorThemeSwitcher";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { ProfileSheet } from "@/components/ProfileSheet";
import DynamicBreadCrumb from "@/components/DynamicBreadCrumb";
import { NotificationsDropdown } from "@/features/chats/components/Notification";
import { NavigationProgress } from "@/components/navigation-progress";

export default function DashboardLayout() {
  return (
    <>
    <NavigationProgress/>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
            <Separator orientation="vertical" className="h-6" />
            <DynamicBreadCrumb/>          
          </div>
          <div className="flex items-center gap-2 px-4">
            <NotificationsDropdown/>
            <ColorThemeSwitcher />
            <ThemeSwitcher />
            <ProfileSheet/>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
    </>
  );
}