import type React from "react"
import { DeviceProvider } from "@/context/device-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DeviceProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-white">
          <AppSidebar />
          <div className="flex-1 overflow-auto bg-white">{children}</div>
        </div>
      </SidebarProvider>
    </DeviceProvider>
  )
}
