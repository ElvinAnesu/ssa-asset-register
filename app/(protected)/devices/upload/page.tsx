"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDevices } from "@/context/device-context"
import * as XLSX from "xlsx"
import { type DeviceType, type DeviceStatus } from "@/context/device-context"
import { supabase } from '@/lib/supabase'

const normalizeDeviceType = (input: string): DeviceType | undefined => {
  if (!input) return undefined;
  const normalized = input.trim().toLowerCase();
  switch (normalized) {
    case "computer": return "Computer";
    case "laptop": return "Laptop";
    case "printer": return "Printer";
    case "scanner": return "Scanner";
    case "sim card": return "SIM Card";
    case "office phone": return "Office Phone";
    case "router": return "Router";
    case "pocket wifi": return "Pocket Wifi";
    case "ups": return "UPS";
    default: return undefined;
  }
};

export async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .order('id', { ascending: false })
  if (error) throw error
  return data
}

export async function addActivity(activity) {
  const { data, error } = await supabase
    .from('activities')
    .insert([activity])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateActivity(id, updates) {
  const { data, error } = await supabase
    .from('activities')
    .update(updates)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function deleteActivity(id) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export default function UploadDevicesPage() {
  const router = useRouter()
  const { addDevice } = useDevices()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          selectedFile.type === "application/vnd.ms-excel") {
        setFile(selectedFile)
        setError(null)
      } else {
        setError("Please upload an Excel file (.xlsx or .xls)")
        setFile(null)
      }
    }
  }

  const processExcelFile = async (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false })
          resolve(jsonData)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = (err) => reject(err)
      reader.readAsBinaryString(file)
    })
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)
    setSuccess(null)
    setUploadProgress(0)

    try {
      const jsonData = await processExcelFile(file)
      const devices = jsonData as any[]
      let successCount = 0
      let errorCount = 0
      let errorMessages: string[] = []

      for (let i = 0; i < devices.length; i++) {
        const device = devices[i]
        try {
          // Normalize column names (case-insensitive)
          const normalizedDevice = Object.entries(device).reduce((acc, [key, value]) => {
            const normalizedKey = key.toLowerCase().trim()
            acc[normalizedKey] = value
            return acc
          }, {} as Record<string, any>)

          // Map Excel columns to device fields with flexible column names
          const rawType = normalizedDevice.type || normalizedDevice['device type'] || normalizedDevice['devicetype'];
          const deviceData = {
            type: normalizeDeviceType(rawType) as DeviceType,
            serialNumber: normalizedDevice['serial number'] || normalizedDevice.serialnumber || normalizedDevice.serial || normalizedDevice['seerial number'],
            modelNumber: normalizedDevice['model number'] || normalizedDevice.modelnumber || normalizedDevice.model || "",
            assignedTo: normalizedDevice['assigned to'] || normalizedDevice.assignedto || normalizedDevice.assigned || "",
            status: (normalizedDevice.status || "Available") as DeviceStatus,
            department: normalizedDevice.department || "",
            warranty: normalizedDevice.warranty || "",
            dateAssigned: normalizedDevice['date assigned'] || normalizedDevice.dateassigned || normalizedDevice.date || new Date().toISOString().split("T")[0],
          }

          // Validate required fields with detailed error messages
          const missingFields = []
          if (!deviceData.type) missingFields.push("Type")
          if (!deviceData.serialNumber) missingFields.push("Serial Number")

          if (missingFields.length > 0) {
            throw new Error(`Row ${i + 2}: Missing required fields: ${missingFields.join(", ")}`)
          }

          await addDevice(deviceData)
          successCount++
        } catch (err: any) {
          console.error(`Error processing device at row ${i + 2}:`, err)
          errorCount++
          errorMessages.push(err.message)
        }

        // Update progress
        setUploadProgress(Math.round(((i + 1) / devices.length) * 100))
      }

      if (successCount > 0) {
        setSuccess(`Successfully added ${successCount} devices${errorCount > 0 ? ` (${errorCount} failed)` : ''}`)
        if (errorCount > 0) {
          setError(`Failed to process some devices:\n${errorMessages.join("\n")}`)
        }
        setTimeout(() => {
          router.push("/devices")
        }, 2000)
      } else {
        setError("No devices were successfully added. Please check your Excel file format.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to process Excel file. Please ensure the file is in the correct format.")
    } finally {
      setIsUploading(false)
    }
  }

  useEffect(() => {
    supabase.from('activities').select('*').then(console.log)
  }, [])

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
        <h1 className="text-lg font-semibold">Upload Devices</h1>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl mx-auto bg-white min-h-[calc(100vh-4rem)]">
        <Card className="border-none shadow-md bg-white">
          <CardHeader>
            <CardTitle>Upload Devices from Excel</CardTitle>
            <CardDescription>
              <p className="mb-4">
                Upload your device inventory using an Excel file. The file should contain at least "Type" and "Serial Number".
                Other fields like "Model Number", "Status", "Assigned To", "Department", "Warranty", and "Date Assigned" are optional.
              </p>
              <p className="text-sm text-gray-600">
                Column names are flexible (e.g., "Type", "Device Type", or "DeviceType").
              </p>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 whitespace-pre-line">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      {file ? file.name : "Click to select Excel file"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Supports .xlsx and .xls files
                    </span>
                  </label>
                </div>

                {isUploading && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isUploading || !file}>
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <Button asChild variant="outline" type="button" disabled={isUploading}>
                  <Link href="/devices">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SidebarInset>
  )
} 