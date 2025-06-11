"use client"

import { Home, List, FileBarChart, Plus, BarChart } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useDevices } from "@/context/device-context"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Devices",
    url: "/devices",
    icon: List,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: FileBarChart,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { getDeviceCount } = useDevices()

  // Helper function to check if a menu item is active
  const isActive = (url: string) => {
    if (url === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/" || pathname === ""
    }
    return pathname.startsWith(url)
  }

  return (
    <Sidebar className="bg-gradient-to-b from-white to-blue-50 shadow-xl rounded-r-3xl min-w-[200px] max-w-[240px] font-inter">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-bold font-inter">HI</div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-bold text-lg font-inter">Hesu Investment Limited</span>
            <span className="truncate text-xs text-muted-foreground font-inter">{getDeviceCount()} Devices Registered</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-inter">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="mb-0.5">
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} className={`flex items-center gap-4 px-4 py-2.5 rounded-lg transition-all text-base font-medium font-inter ${isActive(item.url) ? 'bg-blue-100 text-blue-800 shadow' : 'hover:bg-blue-50 text-gray-700'}`}>
                      <item.icon className={`h-7 w-7 ${isActive(item.url) ? 'text-blue-700' : 'text-gray-400'}`} />
                      <span>{item.title}</span>
                      {isActive(item.url) && <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="font-inter">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/devices/add" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-50 text-blue-700 font-inter">
                    <Plus className="h-5 w-5" />
                    <span>Add Device</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* Hide SidebarRail on desktop for a cleaner look */}
    </Sidebar>
  )
}
