"use client"
import { Monitor, Users, AlertTriangle, CheckCircle, Laptop, Printer, Smartphone, Scan, Phone } from "lucide-react"
import { useDevices } from "@/context/device-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()
  const {
    getDeviceCount,
    getDeviceCountByStatus,
    getDeviceCountByType,
    devices,
    loading,
    isUsingMockData,
    needsTableSetup,
    error,
  } = useDevices()

  // Redirect to dashboard
  useEffect(() => {
    router.push("/dashboard")
  }, [router])

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

  // Device category counts for the dashboard
  const deviceCategories = [
    {
      type: "Computer",
      count: getDeviceCountByType("Computer"),
      icon: Laptop,
      color: "text-blue-600 bg-blue-100",
    },
    {
      type: "Printer",
      count: getDeviceCountByType("Printer"),
      icon: Printer,
      color: "text-green-600 bg-green-100",
    },
    {
      type: "Scanner",
      count: getDeviceCountByType("Scanner"),
      icon: Scan,
      color: "text-purple-600 bg-purple-100",
    },
    {
      type: "SIM Card",
      count: getDeviceCountByType("SIM Card"),
      icon: Smartphone,
      color: "text-amber-600 bg-amber-100",
    },
    {
      type: "Office Phone",
      count: getDeviceCountByType("Office Phone"),
      icon: Phone,
      color: "text-rose-600 bg-rose-100",
    },
  ]

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

  // Show loading indicator while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin mx-auto mb-4 rounded-full border-2 border-purple-600 border-t-transparent"></div>
        <p className="text-gray-600">Loading Asset Register...</p>
      </div>
    </div>
  )
}
