import { AppSidebar } from "@/components/app-sidebar";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { NavUser } from "@/components/nav-user";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function DashboardLayout() {
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/vite.svg",
  };
  const location = useLocation();
  //Extract current path from URL 
  const paths = location.pathname.split("/").slice(1);

  //Show BreadCrumb texts properly 
  function toTitleCase(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 justify-between items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                {paths.map((segment, index) => {
                  // join all the previous segments with a "/"
                  const href = "/" + paths.slice(0, index + 1).join("/"); 
                  return (
                    <React.Fragment key={index}>
                      <BreadcrumbItem className="hidden md:block">
                        {index === paths.length - 1 ? (
                          <BreadcrumbPage>{toTitleCase(segment)}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={href}>{toTitleCase(segment)}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index !== paths.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2 px-4">
            <ThemeSwitcher />
            <NavUser isPartOfHeader={true} user={user} />
          </div>
        </header>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
