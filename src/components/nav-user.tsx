"use client"

import {
  Bell,
  ChevronsUpDown,
  House,
  LogOut,
  Settings,
  SquareUser,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth.store"
import { AuthState } from "@/types/auth"
import { Link } from "react-router-dom"



interface NavUserProps{
  user:AuthState["user"]
}

export function NavUser({
  user
}:NavUserProps) {
  const { isMobile } = useSidebar()
  const {logout} = useAuthStore();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                <AvatarFallback className="rounded-lg">{user?.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
             <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{user?.username}</span>
                            <span className="truncate text-xs">{user?.email}</span>
                          </div>
              <ChevronsUpDown className="ml-auto size-4" />
            
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side= {isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
   
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.username}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="*:hover:cursor-pointer">
              <DropdownMenuItem asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <House />
                Home
              </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SquareUser />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link to="/settings/account" className="flex items-center gap-2">
                  <Settings />
                  Settings
                </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="hover:cursor-pointer" onClick={() => {void logout()}}>
              <LogOut/>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
