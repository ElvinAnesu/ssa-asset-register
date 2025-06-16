"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useDevices, type DeviceType, type DeviceStatus } from "@/context/device-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function AddDevicePage() {
  const router = useRouter()
  const { addDevice } = useDevices()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    serialNumber: "",
    modelNumber: "",
    type: "",
    status: "Active",
    assignedTo: "",
    dateAssigned: "",
  })
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    // Validation
    if (!formData.serialNumber) {
      setFormError("Serial number is required.")
      setLoading(false)
      return
    }
    if (!formData.type) {
      setFormError("Device type is required.")
      setLoading(false)
      return
    }
    if (!formData.status) {
      setFormError("Status is required.")
      setLoading(false)
      return
    }
    try {
      await addDevice({
        ...formData,
        type: formData.type as DeviceType,
        status: formData.status as DeviceStatus,
        dateAssigned: formData.dateAssigned || new Date().toISOString().split("T")[0],
      })
      router.push("/devices")
    } catch (error) {
      setFormError("Error adding device.")
      console.error("Error adding device:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <SidebarInset className="h-full bg-white">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div>
          <h1 className="text-lg font-semibold">Add Device</h1>
          <p className="text-xs text-muted-foreground">Register a new device</p>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6 bg-white">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/devices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Devices
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-xl bg-gradient-to-b from-white to-blue-50 max-w-3xl mx-auto p-8 rounded-2xl">
          <CardHeader className="pb-6 text-center">
            <CardTitle className="text-2xl font-bold">Add New Device</CardTitle>
            <CardDescription>Fill in the details below to register a new device.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 md:p-0">
            <TooltipProvider>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 items-start">
                {formError && <div className="text-red-600 text-sm mb-2 col-span-full">{formError}</div>}
                <div className="flex flex-col gap-1 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="serialNumber" aria-label="Serial Number">Serial Number *</Label>
                    </TooltipTrigger>
                    <TooltipContent>Unique identifier for the device. Required.</TooltipContent>
                  </Tooltip>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => handleChange("serialNumber", e.target.value)}
                    placeholder="Enter serial number"
                    required
                    aria-label="Serial Number"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="modelNumber" aria-label="Model Number">Model Number</Label>
                    </TooltipTrigger>
                    <TooltipContent>Device model number (optional).</TooltipContent>
                  </Tooltip>
                  <Input
                    id="modelNumber"
                    value={formData.modelNumber}
                    onChange={(e) => handleChange("modelNumber", e.target.value)}
                    placeholder="Enter model number (optional)"
                    aria-label="Model Number"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="type" aria-label="Device Type">Device Type *</Label>
                    </TooltipTrigger>
                    <TooltipContent>Select the type of device. Required.</TooltipContent>
                  </Tooltip>
                  <Select value={formData.type} onValueChange={(value) => handleChange("type", value)} required aria-label="Device Type">
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer">Computer</SelectItem>
                      <SelectItem value="Laptop">Laptop</SelectItem>
                      <SelectItem value="Printer">Printer</SelectItem>
                      <SelectItem value="Scanner">Scanner</SelectItem>
                      <SelectItem value="SIM Card">SIM Card</SelectItem>
                      <SelectItem value="Office Phone">Office Phone</SelectItem>
                      <SelectItem value="Monitor">Monitor</SelectItem>
                      <SelectItem value="Keyboard">Keyboard</SelectItem>
                      <SelectItem value="Mouse">Mouse</SelectItem>
                      <SelectItem value="Router">Router</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="status" aria-label="Status">Status *</Label>
                    </TooltipTrigger>
                    <TooltipContent>Current status of the device. Required.</TooltipContent>
                  </Tooltip>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)} required aria-label="Status">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="assignedTo" aria-label="Assigned To">Assigned To</Label>
                    </TooltipTrigger>
                    <TooltipContent>Employee name (optional).</TooltipContent>
                  </Tooltip>
                  <Input
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => handleChange("assignedTo", e.target.value)}
                    placeholder="Employee name (optional)"
                    aria-label="Assigned To"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full md:col-span-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="dateAssigned" aria-label="Date Assigned">Date Assigned</Label>
                    </TooltipTrigger>
                    <TooltipContent>Date the device was assigned. Leave empty to use today's date.</TooltipContent>
                  </Tooltip>
                  <Input
                    id="dateAssigned"
                    type="date"
                    value={formData.dateAssigned}
                    onChange={(e) => handleChange("dateAssigned", e.target.value)}
                    aria-label="Date Assigned"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty to use today's date</p>
                </div>
                <div className="flex justify-end col-span-full pt-6">
                  <Button type="submit" disabled={loading} className="px-8 py-2 text-base font-semibold rounded-lg shadow bg-blue-600 hover:bg-blue-700 text-white">
                    {loading ? <Save className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Register Device
                  </Button>
                </div>
              </form>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
