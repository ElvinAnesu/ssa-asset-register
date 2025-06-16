"use client"

import { useState } from "react"
import Link from "next/link"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useDevices, type DeviceStatus } from "@/context/device-context"
import { Skeleton } from "@/components/ui/skeleton"
import { MockDataBanner } from "@/components/mock-data-banner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function DevicesPage() {
  const { devices, deleteDevice, loading, error, isUsingMockData, needsTableSetup } = useDevices()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>("serialNumber")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.department || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || device.type.toLowerCase() === filterType.toLowerCase()
    const matchesStatus = filterStatus === "all" || device.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const getDeviceValue = (device: typeof devices[number], key: string) => {
    switch (key) {
      case "type": return device.type || "";
      case "serialNumber": return device.serialNumber || "";
      case "assignedTo": return device.assignedTo || "";
      case "status": return device.status || "";
      case "dateAssigned": return device.dateAssigned || "";
      case "modelNumber": return device.modelNumber || "";
      case "department": return device.department || "";
      case "warranty": return device.warranty || "";
      default: return "";
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const sortedDevices = [...filteredDevices].sort((a, b) => {
    const aValue = getDeviceValue(a, sortBy);
    const bValue = getDeviceValue(b, sortBy);
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  })

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

  const handleDeleteDevice = (id: string) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = async () => {
    if (confirmDeleteId) {
      setIsDeleting(confirmDeleteId)
      await deleteDevice(confirmDeleteId)
      setIsDeleting(null)
      setConfirmDeleteId(null)
    }
  }

  const cancelDelete = () => setConfirmDeleteId(null)

  return (
    <SidebarInset className="h-full bg-white">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Devices</h1>
        <div className="ml-auto">
          <Button asChild>
            <Link href="/devices/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Device
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 bg-white min-h-[calc(100vh-4rem)]">
        <MockDataBanner isVisible={isUsingMockData} needsTableSetup={needsTableSetup} error={error} />

        {/* Search and Filter Controls */}
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Device Management</CardTitle>
            <CardDescription>Manage and track all your organization's devices</CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search devices, serial numbers, or assigned users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue placeholder="Device Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="computer">Computer</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="scanner">Scanner</SelectItem>
                    <SelectItem value="sim card">SIM Card</SelectItem>
                    <SelectItem value="office phone">Office Phone</SelectItem>
                    <SelectItem value="laptop">Laptop</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px] bg-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error message - only show if not using mock data and not table setup issue */}
        {error && !isUsingMockData && !needsTableSetup && (
          <Card className="border-none shadow-md bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Devices Table */}
        <Card className="border-none shadow-md flex-1 bg-white">
          <CardContent className="p-0 bg-white">
            <Table className="font-inter shadow-md rounded-xl border-none bg-white">
              <TableHeader>
                <TableRow className="bg-blue-50 rounded-t-xl">
                  <TableHead className="font-bold text-base px-5 py-3">Device Type</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Serial Number</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Assigned To</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Department</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Warranty</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Status</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Date Assigned</TableHead>
                  <TableHead className="font-bold text-base px-5 py-3">Model Number</TableHead>
                  <TableHead className="w-[50px] font-bold text-base px-5 py-3"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {loading
                  ? // Loading skeleton rows
                    Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <TableRow key={i} className="bg-white">
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-20" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-5 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </TableCell>
                        </TableRow>
                      ))
                  : sortedDevices.map((device, idx) => (
                      <TableRow key={device.id} className={`transition hover:bg-blue-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'} rounded-lg px-5 py-3`}>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.type}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.serialNumber}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.assignedTo || "Not assigned"}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.department || "Not assigned"}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.warranty || "Not specified"}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{getStatusBadge(device.status)}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.dateAssigned || "Not assigned"}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm">{device.modelNumber || "-"}</TableCell>
                        <TableCell className="px-5 py-3 font-inter text-sm flex gap-2 items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={isDeleting === device.id}>
                                {isDeleting === device.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <MoreHorizontal className="h-5 w-5" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                              <DropdownMenuItem asChild>
                                <Link href={`/devices/edit/${device.id}`} className="flex items-center">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteDevice(device.id)}
                                disabled={isDeleting === device.id}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {!loading && sortedDevices.length === 0 && (
          <Card className="border-none shadow-md bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12 bg-white">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No devices found</h3>
              <p className="text-muted-foreground text-center mb-4">
                No devices match your current search and filter criteria.
              </p>
              <Button asChild>
                <Link href="/devices/add">Add New Device</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!confirmDeleteId} onOpenChange={cancelDelete}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Device</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this device? This action cannot be undone.</p>
            <DialogFooter>
              <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting !== null}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarInset>
  )
}
