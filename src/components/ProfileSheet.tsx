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
  const { user, logout } = useAuthStore();
  
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
      href: "/settings/account",
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer border border-border/50 hover:border-border transition-colors"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl} alt={user?.username} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
              {user?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </SidebarMenuButton>
      </SheetTrigger>
      <SheetTitle className="sr-only">User Profile Menu</SheetTitle>
      <SheetDescription className="sr-only">Navigation and user options</SheetDescription>
      <SheetContent className="w-full max-w-[320px] sm:w-[300px] bg-background/95 backdrop-blur-sm border-l">
        <div className="flex flex-col h-full">
          <div className="flex flex-col items-center space-y-3 py-8 px-6 border-b bg-gradient-to-b from-muted/50 to-transparent">
            <Avatar className="h-20 w-20 ring-2 ring-border/50 ring-offset-2 ring-offset-background">
              <AvatarImage src={user?.avatarUrl} alt={user?.username} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-xl font-semibold">
                {user?.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center space-y-1 text-center">
              <h4 className="text-lg font-semibold tracking-tight">{user?.username}</h4>
              <p className="text-sm text-muted-foreground font-medium">{user?.email}</p>
            </div>
          </div>
          
          <nav className="flex-1 py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <SheetClose key={item.href} asChild>
                <Link
                  to={item.href}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground border border-transparent hover:border-border/50 active:scale-[0.98]"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </SheetClose>
            ))}
          </nav>
          
          <div className="p-3 border-t bg-muted/30">
            <SheetClose asChild>
              <button
                type="button"
                onClick={() => { void logout(); }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20 active:scale-[0.98] group"
              >
                <LogOut className="h-4 w-4 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Log out</span>
              </button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}