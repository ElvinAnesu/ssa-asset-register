import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { DeviceProvider } from "@/context/device-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DeviceProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full bg-white">
              <AppSidebar />
              <div className="flex-1 overflow-auto bg-white">{children}</div>
            </div>
          </SidebarProvider>
        </DeviceProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
