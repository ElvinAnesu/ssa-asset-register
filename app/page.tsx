"use client"
import { Monitor, Users, AlertTriangle, CheckCircle, Laptop, Printer, Smartphone, Scan, Phone } from "lucide-react"
import { useDevices } from "@/context/device-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ListChecks, FolderKanban } from "lucide-react"

export default function LandingPage() {
  const tiles = [
    {
      title: "This System",
      description: "Asset Register System",
      icon: <Monitor className="w-10 h-10 mb-2 text-purple-600" />,
      href: "/dashboard",
      color: "bg-purple-100 hover:bg-purple-200 border-purple-200",
    },
    {
      title: "Activities",
      description: "View and manage activities",
      icon: <ListChecks className="w-10 h-10 mb-2 text-blue-600" />,
      href: "/activities",
      color: "bg-blue-100 hover:bg-blue-200 border-blue-200",
    },
    {
      title: "Project",
      description: "Project management",
      icon: <FolderKanban className="w-10 h-10 mb-2 text-cyan-600" />,
      href: "/project",
      color: "bg-cyan-100 hover:bg-cyan-200 border-cyan-200",
    },
    {
      title: "Incident",
      description: "Report and track incidents",
      icon: <AlertTriangle className="w-10 h-10 mb-2 text-red-600" />,
      href: "/incident",
      color: "bg-red-100 hover:bg-red-200 border-red-200",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-3xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              className={`rounded-xl border shadow-md p-8 flex flex-col items-center transition-all duration-200 cursor-pointer ${tile.color}`}
            >
              {tile.icon}
              <span className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">{tile.title}</span>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">{tile.description}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
