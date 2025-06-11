"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileSpreadsheet, FileText, Users, Monitor, Calendar, Loader2 } from "lucide-react"
import { useDevices, type DeviceStatus } from "@/context/device-context"

export default function ReportsPage() {
  const { devices, getDeviceCount, getDeviceCountByStatus, getDeviceCountByType, loading, error } = useDevices()
  const [reportType, setReportType] = useState<string>("all-devices")
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Get employee assignments (one employee can have multiple devices)
  const getEmployeeAssignments = () => {
    const assignments: { [key: string]: any[] } = {}

    devices.forEach((device) => {
      if (device.assignedTo && device.assignedTo.trim() !== "") {
        if (!assignments[device.assignedTo]) {
          assignments[device.assignedTo] = []
        }
        assignments[device.assignedTo].push(device)
      }
    })

    return Object.entries(assignments).map(([employee, deviceList]) => ({
      employee,
      devices: deviceList,
      deviceCount: deviceList.length,
      activeDevices: deviceList.filter((d) => d.status === "Active").length,
      availableDevices: deviceList.filter((d) => d.status === "Available").length,
      maintenanceDevices: deviceList.filter((d) => d.status === "Maintenance").length,
    }))
  }

  const employeeAssignments = getEmployeeAssignments()

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Maintenance":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Maintenance</Badge>
      case "Available":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Available</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const exportToPDF = async () => {
    setIsExporting(true)
    try {
      // Create a simple HTML structure for PDF export
      const reportData = reportType === "employee-assignments" ? employeeAssignments : devices
      const reportTitle =
        reportType === "employee-assignments" ? "Employee Device Assignments Report" : "All Devices Report"

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hesu Investment Limited - ${reportTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background-color: white; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              h2 { color: #555; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; background-color: white; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; background-color: white; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .status-active { background-color: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; }
              .status-available { background-color: #cce7ff; color: #004085; padding: 4px 8px; border-radius: 4px; }
              .status-maintenance { background-color: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; }
              .summary { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
              .company-header { text-align: center; margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="company-header">
              <h1>Hesu Investment Limited</h1>
              <h2>Devices List and Employee Assigned To</h2>
            </div>
            
            <div class="summary">
              <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Total Devices:</strong> ${getDeviceCount()}</p>
              <p><strong>Active Devices:</strong> ${getDeviceCountByStatus("Active")}</p>
              <p><strong>Available Devices:</strong> ${getDeviceCountByStatus("Available")}</p>
              <p><strong>Maintenance Required:</strong> ${getDeviceCountByStatus("Maintenance")}</p>
            </div>
            ${
              reportType === "employee-assignments"
                ? `
              <table>
                <thead>
                  <tr>
                    <th>Employee Name</th>
                    <th>Total Devices</th>
                    <th>Active</th>
                    <th>Available</th>
                    <th>Maintenance</th>
                    <th>Device Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${employeeAssignments
                    .map(
                      (assignment) => `
                    <tr>
                      <td>${assignment.employee}</td>
                      <td>${assignment.deviceCount}</td>
                      <td>${assignment.activeDevices}</td>
                      <td>${assignment.availableDevices}</td>
                      <td>${assignment.maintenanceDevices}</td>
                      <td>${assignment.devices.map((d) => `${d.type} (${d.serialNumber})`).join(", ")}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            `
                : `
              <table>
                <thead>
                  <tr>
                    <th>Device Type</th>
                    <th>Serial Number</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Date Assigned</th>
                  </tr>
                </thead>
                <tbody>
                  ${devices
                    .map(
                      (device) => `
                    <tr>
                      <td>${device.type}</td>
                      <td>${device.serialNumber}</td>
                      <td>${device.assignedTo || "Not assigned"}</td>
                      <td><span class="status-${device.status.toLowerCase()}">${device.status}</span></td>
                      <td>${device.dateAssigned || "Not assigned"}</td>
                    </tr>
                  `,
                    )
                    .join("")}
                </tbody>
              </table>
            `
            }
          </body>
        </html>
      `

      // Create a new window and print
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        printWindow.print()
      }
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = () => {
    const reportData = reportType === "employee-assignments" ? employeeAssignments : devices
    const reportTitle =
      reportType === "employee-assignments" ? "Employee Device Assignments Report" : "All Devices Report"

    let csvContent = "Hesu Investment Limited\nDevices List and Employee Assigned To\n\n"
    csvContent += `Report Type: ${reportTitle}\n`
    csvContent += `Generated on: ${new Date().toLocaleDateString()}\n\n`

    if (reportType === "employee-assignments") {
      csvContent += "Employee Name,Total Devices,Active,Available,Maintenance,Device Details\n"
      employeeAssignments.forEach((assignment) => {
        const deviceDetails = assignment.devices.map((d) => `${d.type} (${d.serialNumber})`).join("; ")
        csvContent += `"${assignment.employee}",${assignment.deviceCount},${assignment.activeDevices},${assignment.availableDevices},${assignment.maintenanceDevices},"${deviceDetails}"\n`
      })
    } else {
      csvContent += "Device Type,Serial Number,Assigned To,Status,Date Assigned,Notes\n"
      devices.forEach((device) => {
        csvContent += `"${device.type}","${device.serialNumber}","${device.assignedTo || "Not assigned"}","${device.status}","${device.dateAssigned || "Not assigned"}","${device.notes || ""}"\n`
      })
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `Hesu_Investment_${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const stats = [
    {
      title: "Total Employees",
      value: employeeAssignments.length,
      description: "With assigned devices",
      icon: Users,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Devices",
      value: getDeviceCount(),
      description: "All registered devices",
      icon: Monitor,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Assigned Devices",
      value: devices.filter((d) => d.assignedTo && d.assignedTo.trim() !== "").length,
      description: "Currently assigned",
      icon: Calendar,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Unassigned Devices",
      value: devices.filter((d) => !d.assignedTo || d.assignedTo.trim() === "").length,
      description: "Available for assignment",
      icon: Monitor,
      color: "text-amber-600 bg-amber-100",
    },
  ]

  return (
    <SidebarInset className="h-full bg-white">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Reports</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 bg-white min-h-[calc(100vh-4rem)]">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center">
            <p className="text-red-600">Error loading data: {error.message}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Asset Reports</h2>
                <p className="text-muted-foreground">Hesu Investment Limited</p>
              </div>
              <div className="flex gap-2">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="w-[200px] bg-white">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all-devices">All Devices</SelectItem>
                    <SelectItem value="employee-assignments">Employee Assignments</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={exportToPDF} variant="outline" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </>
                  )}
                </Button>
                <Button onClick={exportToExcel} disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export Excel
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
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

            {/* Report Content */}
            <Card className="border-none shadow-md flex-1 bg-white">
              <CardHeader>
                <CardTitle>
                  {reportType === "employee-assignments" ? "Employee Device Assignments" : "All Devices"}
                </CardTitle>
                <CardDescription>
                  {reportType === "employee-assignments"
                    ? "View devices assigned to each employee (employees can have multiple devices)"
                    : "Complete list of all registered devices"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 bg-white">
                {reportType === "employee-assignments" ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white">
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Total Devices</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Maintenance</TableHead>
                        <TableHead>Device Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                      {employeeAssignments.map((assignment, index) => (
                        <TableRow key={index} className="bg-white">
                          <TableCell className="font-medium">{assignment.employee}</TableCell>
                          <TableCell className="font-bold">{assignment.deviceCount}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">{assignment.activeDevices}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">{assignment.availableDevices}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-amber-100 text-amber-800">{assignment.maintenanceDevices}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {assignment.devices.map((device, deviceIndex) => (
                                <div key={deviceIndex} className="text-sm">
                                  <span className="font-medium">{device.type}</span>
                                  <span className="text-muted-foreground"> ({device.serialNumber})</span>
                                  <span className="ml-2">{getStatusBadge(device.status)}</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white">
                        <TableHead>Device Type</TableHead>
                        <TableHead>Serial Number</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date Assigned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white">
                      {devices.map((device) => (
                        <TableRow key={device.id} className="bg-white">
                          <TableCell className="font-medium">{device.type}</TableCell>
                          <TableCell className="font-mono text-sm">{device.serialNumber}</TableCell>
                          <TableCell>{device.assignedTo || "Not assigned"}</TableCell>
                          <TableCell>{getStatusBadge(device.status)}</TableCell>
                          <TableCell>{device.dateAssigned || "Not assigned"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {reportType === "employee-assignments" && employeeAssignments.length === 0 && (
              <Card className="border-none shadow-md bg-white">
                <CardContent className="flex flex-col items-center justify-center py-12 bg-white">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Employee Assignments</h3>
                  <p className="text-muted-foreground text-center">No devices have been assigned to employees yet.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </SidebarInset>
  )
}
