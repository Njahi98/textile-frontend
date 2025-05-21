import { AppSidebar } from "@/components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { ProfileSheet } from "@/components/ProfileSheet";
import DynamicBreadCrumb from "@/components/DynamicBreadCrumb";

export default function DashboardLayout() {
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/av.webp",
  };


  return (
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
            <ThemeSwitcher />
            <NavUser isPartOfHeader={true} user={user} />
            <ProfileSheet user={user}/>
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
