"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // Define public routes where sidebar should not appear
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname.startsWith("/login") || pathname.startsWith("/signup")

  if (isPublicPage) {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
