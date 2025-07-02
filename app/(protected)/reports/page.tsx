"use client"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Users, Download, Search, Loader2 } from "lucide-react"
import { useDevices, type DeviceStatus } from "@/context/device-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from "@/components/ui/chart"
import { toTitleCase } from "@/lib/utils"

export default function ReportsPage() {
  const { devices, getDeviceCount, getDeviceCountByStatus, getEmployeeList, getEmployeeDeviceCount, getDeviceCountByType } = useDevices()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const deviceTypeChartConfig: ChartConfig = {
    computer: { label: "Computer", color: "hsl(0 100% 50%)" }, // Red
    laptop: { label: "Laptop", color: "hsl(240 100% 50%)" }, // Blue
    printer: { label: "Printer", color: "hsl(180 100% 50%)" }, // Cyan
    scanner: { label: "Scanner", color: "hsl(60 100% 50%)" }, // Yellow
    "sim card": { label: "SIM Card", color: "hsl(100 100% 40%)" }, // Lighter Green
    "office phone": { label: "Office Phone", color: "hsl(30 100% 50%)" }, // Orange
    router: { label: "Router", color: "hsl(280 100% 50%)" }, // Purple
    monitor: { label: "Monitor", color: "hsl(200 100% 50%)" }, // Sky Blue
    keyboard: { label: "Keyboard", color: "hsl(330 100% 50%)" }, // Pink
    mouse: { label: "Mouse", color: "hsl(270 10% 60%)" }, // Light Purple/Gray
    other: { label: "Other", color: "hsl(20 100% 50%)" }, // Orange-red
  };

  const deviceStatusChartConfig: ChartConfig = {
    active: { label: "Active", color: "hsl(140 100% 50%)" }, // Green
    available: { label: "Available", color: "hsl(240 100% 50%)" }, // Blue
    maintenance: { label: "Maintenance", color: "hsl(180 100% 50%)" }, // Cyan
    inactive: { label: "Inactive", color: "hsl(0 100% 50%)" }, // Red for Inactive
  };

  // Device type normalization map
  const deviceTypeMap: Record<string, string> = {
    "computer": "Computer",
    "compuetr": "Computer",
    "laptop": "Laptop",
    "printer": "Printer",
    "ups": "UPS",
    "router": "Router",
    "modem": "Modem",
    "mordem": "Modem",
    "pocket wifi": "Pocket Wifi",
    "sim card": "SIM Card",
    "scanner": "Scanner",
    "tablet": "Tablet",
    "phone": "Phone",
    "office phone": "Office Phone",
    "server": "Server",
    "firewall": "Firewall",
    // Add more as needed
  }

  function normalizeDeviceType(type: string): string {
    if (!type) return "Other";
    const key = type.trim().toLowerCase();
    return deviceTypeMap[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : "Other");
  }

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case "Active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "Maintenance":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Maintenance</Badge>
      case "Available":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Available</Badge>
      case "Inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch = 
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.department || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.modelNumber || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || device.type === filterType
    const matchesStatus = filterStatus === "all" || device.status === filterStatus
    const matchesDepartment = filterDepartment === "all" || device.department === filterDepartment

    return matchesSearch && matchesType && matchesStatus && matchesDepartment
  })

  const departments = Array.from(new Set(devices.map(device => device.department).filter(Boolean)))

  const exportToPDF = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      
      // Add company logo or header
      doc.setFontSize(20)
      doc.text("Hesu Investment Limited", pageWidth / 2, 15, { align: "center" })
      doc.setFontSize(16)
      doc.text("Device Inventory System", pageWidth / 2, 25, { align: "center" })
      
      // Add report details
      doc.setFontSize(10)
      const reportDate = new Date().toLocaleDateString()
      doc.text(`Report Date: ${reportDate}`, pageWidth / 2, 35, { align: "center" })
      doc.text(`Total Devices: ${filteredDevices.length}`, pageWidth / 2, 42, { align: "center" })
      
      // Add filters applied
      let yPos = 49
      if (filterType !== "all") doc.text(`Device Type: ${filterType}`, pageWidth / 2, yPos++, { align: "center" })
      if (filterStatus !== "all") doc.text(`Status: ${filterStatus}`, pageWidth / 2, yPos++, { align: "center" })
      if (filterDepartment !== "all") doc.text(`Department: ${filterDepartment}`, pageWidth / 2, yPos++, { align: "center" })
      if (searchTerm) doc.text(`Search Term: ${searchTerm}`, pageWidth / 2, yPos++, { align: "center" })
      
      // Add table
      autoTable(doc, {
        startY: yPos + 5,
        head: [[
          "Device Type",
          "Serial Number",
          "Assigned To",
          "Department",
          "Warranty",
          "Status",
          "Date Assigned",
          "Model Number"
        ]],
        body: filteredDevices.map(device => [
          device.type ? toTitleCase(device.type) : "Not Available",
          device.serialNumber ? device.serialNumber : "Not Available",
          device.assignedTo ? toTitleCase(device.assignedTo) : "Not assigned",
          device.department ? toTitleCase(device.department) : "Not assigned",
          device.warranty && device.warranty.trim().toLowerCase() !== "" && device.warranty.trim().toLowerCase() !== "na" ? toTitleCase(device.warranty) : "Not Available",
          device.status ? toTitleCase(device.status) : "Not Available",
          device.dateAssigned ? toTitleCase(device.dateAssigned) : "Not assigned",
          device.modelNumber ? toTitleCase(device.modelNumber) : "Not Available"
        ]),
        styles: { 
          fontSize: 9,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: { 
          fillColor: [22, 160, 133],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 10 },
        theme: 'grid',
        didDrawPage: function(data) {
          // Add border to the page
          doc.setDrawColor(0, 0, 0)
          doc.setLineWidth(0.5)
          doc.rect(10, 10, pageWidth - 20, doc.internal.pageSize.height - 20)
        }
      })
      
      // Add footer
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Page ${i} of ${pageCount} - Generated on ${reportDate}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        )
      }

      // Generate the PDF blob
      const pdfBlob = doc.output('blob')
      
      // Create a download link
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hesu-device-inventory-${new Date().toISOString().split("T")[0]}.pdf`
      
      // Trigger the download
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setExportError(err.message || "Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  const exportToExcel = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(
        filteredDevices.map(device => ({
          "Device Type": device.type ? toTitleCase(device.type) : "Not Available",
          "Serial Number": device.serialNumber ? device.serialNumber : "Not Available",
          "Assigned To": device.assignedTo ? toTitleCase(device.assignedTo) : "Not assigned",
          "Department": device.department ? toTitleCase(device.department) : "Not assigned",
          "Warranty": device.warranty && device.warranty.trim().toLowerCase() !== "" && device.warranty.trim().toLowerCase() !== "na" ? toTitleCase(device.warranty) : "Not Available",
          "Status": device.status ? toTitleCase(device.status) : "Not Available",
          "Date Assigned": device.dateAssigned ? toTitleCase(device.dateAssigned) : "Not assigned",
          "Model Number": device.modelNumber ? toTitleCase(device.modelNumber) : "Not Available"
        }))
      )

      // Add company info and filters
      const reportInfo = [
        ["Hesu Investment Limited"],
        ["Device Inventory System"],
        ["Report Date:", new Date().toLocaleDateString()],
        ["Total Devices:", filteredDevices.length],
        [],
        ["Filters Applied:"],
        ...(filterType !== "all" ? [["Device Type:", filterType]] : []),
        ...(filterStatus !== "all" ? [["Status:", filterStatus]] : []),
        ...(filterDepartment !== "all" ? [["Department:", filterDepartment]] : []),
        ...(searchTerm ? [["Search Term:", searchTerm]] : []),
        []
      ]

      // Insert report info at the top
      XLSX.utils.sheet_add_aoa(ws, reportInfo, { origin: "A1" })

      // Style the worksheet
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1")
      
      // Style headers and data
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C })
          if (!ws[address]) continue
          
          // Style for headers (first row of data)
          if (R === 0) {
            ws[address].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "16A085" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            }
          } else {
            // Style for data rows
            ws[address].s = {
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
              }
            }
          }
        }
      }

      // Style company info
      for (let R = 0; R < reportInfo.length; R++) {
        const address = XLSX.utils.encode_cell({ r: R, c: 0 })
        if (ws[address]) {
          ws[address].s = {
            font: { bold: true, size: 14 },
            alignment: { horizontal: "center" }
          }
        }
      }

      // Set column widths
      const colWidths = [
        { wch: 15 }, // Device Type
        { wch: 20 }, // Serial Number
        { wch: 20 }, // Assigned To
        { wch: 20 }, // Department
        { wch: 15 }, // Warranty
        { wch: 15 }, // Status
        { wch: 15 }, // Date Assigned
        { wch: 20 }  // Model Number
      ]
      ws['!cols'] = colWidths

      // Add the worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Device Inventory")

      // Generate the Excel blob
      const excelBlob = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' })
      
      // Convert binary to blob
      const blob = new Blob([s2ab(excelBlob)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hesu-device-inventory-${new Date().toISOString().split("T")[0]}.xlsx`
      
      // Trigger the download
      document.body.appendChild(link)
      link.click()
      
      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      setExportError(err.message || "Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  // Helper function to convert string to ArrayBuffer
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length)
    const view = new Uint8Array(buf)
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF
    return buf
  }

  return (
    <SidebarInset className="h-full bg-white">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Reports</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-5xl mx-auto bg-white min-h-[calc(100vh-4rem)]">
        <h2 className="text-xl font-semibold">Device Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDeviceCount()}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDeviceCountByStatus("Active")}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Devices</CardTitle>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Available</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDeviceCountByStatus("Available")}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Devices</CardTitle>
              <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDeviceCountByStatus("Inactive")}</div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Maintenance</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getDeviceCountByStatus("Maintenance")}</div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <h2 className="text-xl font-semibold">Device Inventory Report</h2>
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle>Device Inventory Report</CardTitle>
            <CardDescription>View and export detailed device information</CardDescription>
          </CardHeader>
          <CardContent>
            {exportError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{exportError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex-1">
                  <Input
                    placeholder="Search devices, serial numbers, or assigned users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Device Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Computer">Computer</SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Printer">Printer</SelectItem>
                      <SelectItem value="Scanner">Scanner</SelectItem>
                      <SelectItem value="SIM Card">SIM Card</SelectItem>
                      <SelectItem value="Office Phone">Office Phone</SelectItem>
                      <SelectItem value="Router">Router</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept || ""}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device Type</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Warranty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date Assigned</TableHead>
                      <TableHead>Model Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDevices.map((device) => (
                      <TableRow key={String(device.id)}>
                        <TableCell>{device.type ? toTitleCase(device.type) : "Not Available"}</TableCell>
                        <TableCell>{device.serialNumber ? device.serialNumber : "Not Available"}</TableCell>
                        <TableCell>{device.assignedTo ? toTitleCase(device.assignedTo) : "Not assigned"}</TableCell>
                        <TableCell>{device.department ? toTitleCase(device.department) : "Not assigned"}</TableCell>
                        <TableCell>{device.warranty && device.warranty.trim().toLowerCase() !== "" && device.warranty.trim().toLowerCase() !== "na" ? toTitleCase(device.warranty) : "Not Available"}</TableCell>
                        <TableCell>{device.status ? toTitleCase(device.status) : "Not Available"}</TableCell>
                        <TableCell>{device.dateAssigned ? toTitleCase(device.dateAssigned) : "Not assigned"}</TableCell>
                        <TableCell>{device.modelNumber ? toTitleCase(device.modelNumber) : "Not Available"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-4">
                <Button onClick={exportToPDF} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export to PDF
                    </>
                  )}
                </Button>
                <Button onClick={exportToExcel} disabled={isExporting} variant="outline">
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export to Excel
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
