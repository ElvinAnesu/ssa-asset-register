"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Monitor, Users, AlertTriangle, CheckCircle, Laptop, Printer, Smartphone, Scan, Phone, Wifi, Globe } from "lucide-react"
import { useDevices } from "@/context/device-context"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Link from "next/link"

export default function Dashboard() {
  const {
    getDeviceCount,
    getDeviceCountByStatus,
    getDeviceCountByType,
    devices,
    loading,
    error,
  } = useDevices()

  // Get unique employees with their device counts
  const getEmployeeStats = () => {
    const employeeDevices: { [key: string]: number } = {}
    devices.forEach((device) => {
      if (device.assignedTo && device.assignedTo.trim() !== "") {
        employeeDevices[device.assignedTo] = (employeeDevices[device.assignedTo] || 0) + 1
      }
    })
    return {
      totalEmployees: Object.keys(employeeDevices).length,
      employeesWithMultipleDevices: Object.values(employeeDevices).filter((count) => count > 1).length,
      totalAssignedDevices: Object.values(employeeDevices).reduce((sum, count) => sum + count, 0),
    }
  }

  const employeeStats = getEmployeeStats()

  const stats = [
    {
      title: "Total Devices",
      value: getDeviceCount(),
      description: "All registered devices",
      icon: Monitor,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Active Devices",
      value: getDeviceCountByStatus("Active"),
      description: "Currently in use",
      icon: CheckCircle,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Employees with Devices",
      value: employeeStats.totalEmployees,
      description: `${employeeStats.employeesWithMultipleDevices} have multiple devices`,
      icon: Users,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Maintenance Required",
      value: getDeviceCountByStatus("Maintenance"),
      description: "Needs attention",
      icon: AlertTriangle,
      color: "text-amber-600 bg-amber-100",
    },
  ]

  // Device type normalization map
  const deviceTypeMap: Record<string, { label: string, icon: any, color: string }> = {
    "computer": { label: "Computer", icon: Laptop, color: "text-blue-600 bg-blue-100" },
    "compuetr": { label: "Computer", icon: Laptop, color: "text-blue-600 bg-blue-100" },
    "laptop": { label: "Laptop", icon: Laptop, color: "text-cyan-600 bg-cyan-100" },
    "printer": { label: "Printer", icon: Printer, color: "text-green-600 bg-green-100" },
    "scanner": { label: "Scanner", icon: Scan, color: "text-purple-600 bg-purple-100" },
    "sim card": { label: "SIM Card", icon: Smartphone, color: "text-amber-600 bg-amber-100" },
    "office phone": { label: "Office Phone", icon: Phone, color: "text-rose-600 bg-rose-100" },
    "router": { label: "Router", icon: Wifi, color: "text-indigo-600 bg-indigo-100" },
    "pocket wifi": { label: "Pocket Wifi", icon: Globe, color: "text-pink-600 bg-pink-100" },
    "ups": { label: "UPS", icon: Monitor, color: "text-gray-700 bg-gray-100" },
    "modem": { label: "Modem", icon: Globe, color: "text-yellow-700 bg-yellow-100" },
    "mordem": { label: "Modem", icon: Globe, color: "text-yellow-700 bg-yellow-100" },
    "tablet": { label: "Tablet", icon: Smartphone, color: "text-green-700 bg-green-100" },
    "phone": { label: "Phone", icon: Phone, color: "text-blue-700 bg-blue-100" },
    "server": { label: "Server", icon: Monitor, color: "text-gray-800 bg-gray-200" },
    "firewall": { label: "Firewall", icon: Globe, color: "text-red-700 bg-red-100" },
    // Add more as needed
  }

  function normalizeDeviceType(type: string) {
    if (!type) return "Other"
    const key = type.trim().toLowerCase()
    return deviceTypeMap[key]?.label || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "Other")
  }

  // Build normalized device categories with accurate counts
  const normalizedCategoriesMap: Record<string, { count: number, icon: any, color: string }> = {}
  devices.forEach((device) => {
    const key = device.type ? device.type.trim().toLowerCase() : "other"
    const config = deviceTypeMap[key]
    const label = config?.label || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "Other")
    if (!normalizedCategoriesMap[label]) {
      normalizedCategoriesMap[label] = {
        count: 0,
        icon: config?.icon || Monitor,
        color: config?.color || "text-gray-700 bg-gray-100",
      }
    }
    normalizedCategoriesMap[label].count++
  })
  const normalizedDeviceCategories = Object.entries(normalizedCategoriesMap).map(([label, { count, icon, color }]) => ({
    type: label,
    count,
    icon,
    color,
  }))

  // Get recent activities from devices
  const recentActivities = devices
    .filter((device) => device.dateAssigned)
    .sort((a, b) => {
      if (!a.dateAssigned || !b.dateAssigned) return 0
      return new Date(b.dateAssigned).getTime() - new Date(a.dateAssigned).getTime()
    })
    .slice(0, 5)

  // Get employees with multiple devices for display
  const getEmployeesWithMultipleDevices = () => {
    const employeeDevices: { [key: string]: any[] } = {}
    devices.forEach((device) => {
      if (device.assignedTo && device.assignedTo.trim() !== "") {
        if (!employeeDevices[device.assignedTo]) {
          employeeDevices[device.assignedTo] = []
        }
        employeeDevices[device.assignedTo].push(device)
      }
    })

    return Object.entries(employeeDevices)
      .filter(([_, deviceList]) => deviceList.length > 1)
      .slice(0, 5)
      .map(([employee, deviceList]) => ({
        employee,
        deviceCount: deviceList.length,
        devices: deviceList,
      }))
  }

  const employeesWithMultipleDevices = getEmployeesWithMultipleDevices()

  // Device status chart data
  const statusData = [
    { status: "Active", count: getDeviceCountByStatus("Active") },
    { status: "Available", count: getDeviceCountByStatus("Available") },
    { status: "Maintenance", count: getDeviceCountByStatus("Maintenance") },
  ]

  return (
    <SidebarInset className="h-full bg-white">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">SSA Logistics</p>
        </div>
        <div className="ml-auto">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition">
            Back to Landing Page
          </Link>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 bg-white min-h-[calc(100vh-4rem)]">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <h2 className="text-2xl font-bold tracking-tight">Asset Overview</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {loading
            ? // Loading skeletons for stats
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="overflow-hidden border-none shadow-md bg-white">
                    <CardHeader className="bg-gray-100 p-4">
                      <Skeleton className="h-5 w-24" />
                    </CardHeader>
                    <CardContent className="p-4 pt-6 bg-white">
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))
            : stats.map((stat) => (
                <Card key={stat.title} className="overflow-hidden border-none shadow-md bg-white">
                  <CardHeader className={`${stat.color} p-4 flex flex-row items-center justify-between space-y-0`}>
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5" />
                  </CardHeader>
                  <CardContent className="p-4 pt-6 bg-white">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Device Categories Section */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Device Categories</CardTitle>
            <CardDescription>Total number of devices by category</CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            {loading
              ? Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="overflow-hidden border-none shadow-sm bg-white">
                      <CardHeader className="bg-gray-100 p-3">
                        <Skeleton className="h-5 w-20" />
                      </CardHeader>
                      <CardContent className="p-3 pt-4 bg-white text-center">
                        <Skeleton className="h-8 w-8 mx-auto mb-2" />
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </CardContent>
                    </Card>
                  ))
              : (
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateRows: 'repeat(2, 1fr)',
                    gridTemplateColumns: `repeat(${Math.ceil(normalizedDeviceCategories.length / 2)}, minmax(0, 1fr))`,
                  }}
                >
                  {normalizedDeviceCategories.map((category) => (
                    <Card key={category.type} className="overflow-hidden border-none shadow-sm bg-white">
                      <CardHeader
                        className={`${category.color} p-3 flex flex-row items-center justify-between space-y-0`}
                      >
                        <CardTitle className="text-sm font-medium">{category.type}</CardTitle>
                        <category.icon className="h-4 w-4" />
                      </CardHeader>
                      <CardContent className="p-3 pt-4 bg-white text-center">
                        <div className="text-2xl font-bold">{category.count}</div>
                        <p className="text-xs text-muted-foreground mt-1">Devices</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest device assignments</CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
              {loading ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-2 w-2 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-full max-w-[250px] mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.type} assigned to {activity.assignedTo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.dateAssigned ? new Date(activity.dateAssigned).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-2">
              <CardTitle>Employees with Multiple Devices</CardTitle>
              <CardDescription>Staff members assigned to multiple devices</CardDescription>
            </CardHeader>
            <CardContent className="bg-white">
              {loading ? (
                <div className="space-y-4">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <div>
                            <Skeleton className="h-5 w-32 mb-1" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-16" />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {employeesWithMultipleDevices.length > 0 ? (
                    employeesWithMultipleDevices.map((employee, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{employee.employee}</p>
                            <p className="text-xs text-muted-foreground">
                              {employee.devices.map((d) => d.type).join(", ")}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-blue-600">{employee.deviceCount} devices</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No employees with multiple devices</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}
