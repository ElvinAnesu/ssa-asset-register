"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useDevices, type DeviceType, type DeviceStatus } from "@/context/device-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function EditDevicePage() {
  const router = useRouter()
  const params = useParams()
  const deviceId = params.id as string
  const { devices, updateDevice, error, loading } = useDevices()

  const [formData, setFormData] = useState({
    type: "" as DeviceType,
    serialNumber: "",
    modelNumber: "",
    assignedTo: "",
    status: "" as DeviceStatus,
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!loading) {
      const device = devices.find((d) => d.id === deviceId)
      if (device) {
        setFormData({
          type: device.type,
          serialNumber: device.serialNumber,
          modelNumber: device.modelNumber || "",
          assignedTo: device.assignedTo || "",
          status: device.status,
          notes: device.notes || "",
        })
      } else {
        setNotFound(true)
      }
    }
  }, [deviceId, devices, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    // Validation
    if (!formData.serialNumber) {
      setFormError("Serial number is required.")
      return
    }
    if (!formData.type) {
      setFormError("Device type is required.")
      return
    }
    if (!formData.status) {
      setFormError("Status is required.")
      return
    }
    setIsSubmitting(true)
    try {
      await updateDevice(deviceId, {
        ...formData,
        type: formData.type as DeviceType,
        status: formData.status as DeviceStatus,
        dateAssigned: formData.assignedTo ? new Date().toISOString().split("T")[0] : null,
      })
      router.push("/devices")
    } catch (err: any) {
      setFormError(err.message || "Failed to update device")
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (notFound) {
    return (
      <SidebarInset className="h-full bg-white">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-lg font-semibold">Device Not Found</h1>
        </header>
        <div className="flex flex-col items-center justify-center h-full bg-white">
          <h2 className="text-2xl font-bold mb-4">Device Not Found</h2>
          <p className="mb-6">The device you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/devices">Return to Devices</Link>
          </Button>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset className="h-full bg-white">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/devices">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Devices
          </Link>
        </Button>
        <Separator orientation="vertical" className="mr-2 h-4" />
        <h1 className="text-lg font-semibold">Edit Device</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl mx-auto bg-white min-h-[calc(100vh-4rem)]">
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle>Edit Device</CardTitle>
            <CardDescription>Update device information and assignment</CardDescription>
          </CardHeader>
          <CardContent className="bg-white">
            {loading ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-px w-full" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-28" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {(formError || error) && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{formError || error}</AlertDescription>
                  </Alert>
                )}

                <TooltipProvider>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {formError && <div className="text-red-600 text-sm mb-2">{formError}</div>}
                    {/* Device Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Device Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label htmlFor="deviceType" aria-label="Device Type">Device Type *</Label>
                            </TooltipTrigger>
                            <TooltipContent>Select the type of device. Required.</TooltipContent>
                          </Tooltip>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => handleInputChange("type", value as DeviceType)}
                            required
                            aria-label="Device Type"
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Computer">Computer</SelectItem>
                              <SelectItem value="Laptop">Laptop</SelectItem>
                              <SelectItem value="Scanner">Scanner</SelectItem>
                              <SelectItem value="Printer">Printer</SelectItem>
                              <SelectItem value="SIM Card">SIM Card</SelectItem>
                              <SelectItem value="Office Phone">Office Phone</SelectItem>
                              <SelectItem value="Router">Router</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label htmlFor="serialNumber" aria-label="Serial Number">Serial Number *</Label>
                            </TooltipTrigger>
                            <TooltipContent>Unique identifier for the device. Required.</TooltipContent>
                          </Tooltip>
                          <Input
                            id="serialNumber"
                            value={formData.serialNumber}
                            onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                            placeholder="Enter serial number"
                            className="bg-white"
                            required
                            aria-label="Serial Number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label htmlFor="modelNumber" aria-label="Model Number">Model Number</Label>
                            </TooltipTrigger>
                            <TooltipContent>Device model number (optional).</TooltipContent>
                          </Tooltip>
                          <Input
                            id="modelNumber"
                            value={formData.modelNumber}
                            onChange={(e) => handleInputChange("modelNumber", e.target.value)}
                            placeholder="Enter model number (optional)"
                            className="bg-white"
                            aria-label="Model Number"
                          />
                        </div>
                      </div>
                    </div>
                    <Separator />
                    {/* Assignment Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Assignment Information</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label htmlFor="assignedTo" aria-label="Assigned To">Assigned To</Label>
                            </TooltipTrigger>
                            <TooltipContent>Employee name (optional).</TooltipContent>
                          </Tooltip>
                          <Input
                            id="assignedTo"
                            value={formData.assignedTo}
                            onChange={(e) => handleInputChange("assignedTo", e.target.value)}
                            placeholder="Enter full name (leave blank if unassigned)"
                            className="bg-white"
                            aria-label="Assigned To"
                          />
                        </div>
                        <div className="space-y-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Label htmlFor="status" aria-label="Status">Status *</Label>
                            </TooltipTrigger>
                            <TooltipContent>Current status of the device. Required.</TooltipContent>
                          </Tooltip>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => handleInputChange("status", value as DeviceStatus)}
                            required
                            aria-label="Status"
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Available">Available</SelectItem>
                              <SelectItem value="Maintenance">Maintenance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    {/* Additional Notes */}
                    <div className="space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label htmlFor="notes" aria-label="Notes">Notes</Label>
                        </TooltipTrigger>
                        <TooltipContent>Additional information about the device (optional).</TooltipContent>
                      </Tooltip>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Enter any additional notes"
                        className="bg-white"
                        aria-label="Notes"
                      />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
                      <Button asChild variant="outline" type="button" disabled={isSubmitting}>
                        <Link href="/devices">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Cancel
                        </Link>
                      </Button>
                    </div>
                  </form>
                </TooltipProvider>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
}
