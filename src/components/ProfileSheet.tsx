import { Link } from "react-router-dom";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { SidebarMenuButton } from "./ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Bell, Home, LogOut, LucideProps, Settings, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

interface NavItem {
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  label: string;
  href: string;
}

export function ProfileSheet() {
  const {user,logout} =useAuthStore();
  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
    },
    {
      icon: User,
      label: "Profile",
      href: "/profile",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/notifications",
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer"
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback>{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetTitle className="sr-only" />
      <SheetDescription className="sr-only" />
      <SheetContent className="w-full max-w-[300px] sm:w-[290px] bg-sidebar text-sidebar-foreground">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col items-center space-y-2 p-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback>
                {user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center space-y-1">
              <h4 className="text-lg font-medium">{user?.username}</h4>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Separator />
          <nav className="flex flex-col space-y-1 p-2">
            {navItems.map((item) => (
              <SheetClose key={item.href} asChild>
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SheetClose>
            ))}
            <SheetClose asChild>
              <button
                type="button"
                onClick={()=>{void logout()}}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent cursor-pointer hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </SheetClose>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
