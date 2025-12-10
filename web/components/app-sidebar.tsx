"use client"

import * as React from "react"
import {
  Inbox,
  Settings,
  User,
  LogOut,
  LayoutDashboard,
  Moon,
  Sun,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { api, type User as UserType } from "@/lib/api"
import { parseJwt } from "@/lib/utils"

// Menu items.
const items = [
  {
    title: "Boards",
    url: "/boards",
    icon: LayoutDashboard,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { logout, token } = useAuth()
  const { theme, setTheme } = useTheme()
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(null)

  React.useEffect(() => {
    const fetchUser = async () => {
      if (!token) return
      const decoded = parseJwt(token)
      const userId = decoded?.sub || decoded?.id
      
      if (userId) {
        try {
          const response = await api.getUserById(userId)
          if (response.data?.user) {
            setCurrentUser(response.data.user)
          }
        } catch (error) {
          console.error("Failed to fetch user", error)
        }
      }
    }
    fetchUser()
  }, [token])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
         <div className="flex items-center justify-between gap-2 px-2 py-2">
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">Boardly</span>
            </div>
            <SidebarTrigger className="ml-auto" />
          </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              tooltip="Toggle theme"
            >
              <div className="relative flex items-center justify-center size-4">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </div>
              <span>Toggle theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={currentUser?.profile_image} alt={currentUser?.username} />
                <AvatarFallback className="rounded-lg">
                  {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{currentUser?.username || "User"}</span>
                <span className="truncate text-xs">{currentUser?.email || "user@example.com"}</span>
              </div>
              <LogOut className="ml-auto size-4 group-data-[collapsible=icon]:hidden cursor-pointer hover:text-destructive" onClick={logout}/>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
