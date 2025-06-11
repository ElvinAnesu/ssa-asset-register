"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

export type DeviceType = "Computer" | "Laptop" | "Printer" | "Scanner" | "SIM Card" | "Office Phone"
export type DeviceStatus = "Active" | "Available" | "Maintenance"

export interface Device {
  id: string
  type: DeviceType
  serialNumber: string
  modelNumber?: string
  assignedTo: string
  status: DeviceStatus
  dateAssigned: string | null
  notes?: string
}

interface DeviceContextType {
  devices: Device[]
  loading: boolean
  error: string | null
  isUsingMockData: boolean
  needsTableSetup: boolean
  addDevice: (device: Omit<Device, "id">) => Promise<void>
  updateDevice: (id: string, device: Partial<Device>) => Promise<void>
  deleteDevice: (id: string) => Promise<void>
  getDevicesByType: (type: DeviceType) => Device[]
  getDevicesByStatus: (status: DeviceStatus) => Device[]
  getDevicesByEmployee: (employeeName: string) => Device[]
  getEmployeeList: () => string[]
  getDeviceCount: () => number
  getDeviceCountByType: (type: DeviceType) => number
  getDeviceCountByStatus: (status: DeviceStatus) => number
  getEmployeeDeviceCount: (employeeName: string) => number
  refreshDevices: () => Promise<void>
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined)

// Sample initial data for when Supabase is not configured or table doesn't exist
const initialDevices: Device[] = [
  {
    id: "1",
    type: "Computer",
    serialNumber: "COMP-001-2024",
    modelNumber: "OptiPlex 7090",
    assignedTo: "John Doe",
    status: "Active",
    dateAssigned: "2024-01-15",
    notes: "Main workstation - Dell OptiPlex 7090",
  },
  {
    id: "2",
    type: "Printer",
    serialNumber: "PRNT-002-2024",
    modelNumber: "LaserJet Pro",
    assignedTo: "Jane Smith",
    status: "Active",
    dateAssigned: "2024-01-20",
    notes: "Color laser printer - HP LaserJet Pro",
  },
  {
    id: "3",
    type: "Scanner",
    serialNumber: "SCAN-003-2024",
    assignedTo: "John Doe",
    status: "Active",
    dateAssigned: "2024-01-10",
    notes: "Document scanner - Canon imageFORMULA",
  },
  {
    id: "4",
    type: "SIM Card",
    serialNumber: "SIM-004-2024",
    assignedTo: "Sarah Wilson",
    status: "Active",
    dateAssigned: "2024-01-25",
    notes: "Company phone SIM - MTN Corporate",
  },
  {
    id: "5",
    type: "Office Phone",
    serialNumber: "PHONE-005-2024",
    assignedTo: "John Doe",
    status: "Maintenance",
    dateAssigned: "2024-01-12",
    notes: "Desk phone - needs new battery",
  },
  {
    id: "6",
    type: "Computer",
    serialNumber: "COMP-006-2024",
    assignedTo: "",
    status: "Available",
    dateAssigned: null,
    notes: "Spare laptop - Lenovo ThinkPad",
  },
  {
    id: "7",
    type: "Printer",
    serialNumber: "PRNT-007-2024",
    assignedTo: "Michael Brown",
    status: "Active",
    dateAssigned: "2024-02-01",
    notes: "Black and white printer - Brother HL-L2350DW",
  },
  {
    id: "8",
    type: "Scanner",
    serialNumber: "SCAN-008-2024",
    assignedTo: "",
    status: "Available",
    dateAssigned: null,
    notes: "Portable scanner - Epson WorkForce",
  },
]

export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [needsTableSetup, setNeedsTableSetup] = useState(false)

  const supabaseConfigured = isSupabaseConfigured()
  const supabase = createSupabaseClient()

  // Map database fields to our frontend model
  const mapDbDeviceToDevice = (dbDevice: any): Device => ({
    id: dbDevice.id,
    type: dbDevice.type as DeviceType,
    serialNumber: dbDevice.serial_number,
    modelNumber: dbDevice.model_number,
    assignedTo: dbDevice.assigned_to || "",
    status: dbDevice.status as DeviceStatus,
    dateAssigned: dbDevice.date_assigned,
    notes: dbDevice.notes,
  })

  // Map our frontend model to database fields
  const mapDeviceToDbDevice = (device: Partial<Device>) => {
    const dbDevice: any = {}
    if (device.type !== undefined) dbDevice.type = device.type
    if (device.serialNumber !== undefined) dbDevice.serial_number = device.serialNumber
    if (device.modelNumber !== undefined) dbDevice.model_number = device.modelNumber
    if (device.assignedTo !== undefined) dbDevice.assigned_to = device.assignedTo || null
    if (device.status !== undefined) dbDevice.status = device.status
    if (device.dateAssigned !== undefined) dbDevice.date_assigned = device.dateAssigned
    if (device.notes !== undefined) dbDevice.notes = device.notes
    return dbDevice
  }

  // Check if the error indicates missing table
  const isTableMissingError = (error: any) => {
    return (
      error?.message?.includes('relation "public.devices" does not exist') ||
      error?.message?.includes('table "devices" does not exist') ||
      error?.code === "PGRST116"
    )
  }

  // Fetch devices from Supabase or use mock data
  const fetchDevices = async () => {
    try {
      setLoading(true)
      setNeedsTableSetup(false)

      if (!supabaseConfigured) {
        // Use mock data when Supabase is not configured
        console.log("Using mock data - Supabase not configured")
        setDevices(initialDevices)
        setIsUsingMockData(true)
        setError(null)
        return
      }

      const { data, error } = await supabase.from("devices").select("*")

      if (error) {
        if (isTableMissingError(error)) {
          // Silently use mock data when table doesn't exist
          console.log("Database table not found - using mock data")
          setDevices(initialDevices)
          setIsUsingMockData(true)
          setNeedsTableSetup(true)
          setError(null) // Don't show error to user
          return
        }
        throw error
      }

      const mappedDevices = data.map(mapDbDeviceToDevice)
      setDevices(mappedDevices)
      setIsUsingMockData(false)
      setNeedsTableSetup(false)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching devices:", err)

      // Fallback to mock data on any error
      console.log("Falling back to mock data due to error:", err.message)
      setDevices(initialDevices)
      setIsUsingMockData(true)

      if (isTableMissingError(err)) {
        setNeedsTableSetup(true)
        setError(null) // Don't show error to user for table setup
      } else {
        setError(`Database connection failed. Using demo data.`)
      }
    } finally {
      setLoading(false)
    }
  }

  // Load devices on mount
  useEffect(() => {
    fetchDevices()

    // Set up real-time subscription only if Supabase is configured and table exists
    if (supabaseConfigured && !needsTableSetup) {
      const subscription = supabase
        .channel("devices-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, () => {
          fetchDevices()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [supabaseConfigured, needsTableSetup])

  const refreshDevices = async () => {
    await fetchDevices()
  }

  const addDevice = async (device: Omit<Device, "id">) => {
    try {
      setLoading(true)

      if (!supabaseConfigured || isUsingMockData || needsTableSetup) {
        // Add to mock data
        const newDevice = {
          ...device,
          id: Math.random().toString(36).substring(2, 9),
        }
        setDevices((prev) => [...prev, newDevice])
        setError(null)
        return
      }

      const dbDevice = mapDeviceToDbDevice(device)
      const { data, error } = await supabase.from("devices").insert(dbDevice).select()

      if (error) {
        if (isTableMissingError(error)) {
          // Silently fall back to mock data
          setNeedsTableSetup(true)
          const newDevice = {
            ...device,
            id: Math.random().toString(36).substring(2, 9),
          }
          setDevices((prev) => [...prev, newDevice])
          setError(null)
          return
        }
        throw error
      }

      if (data && data[0]) {
        const newDevice = mapDbDeviceToDevice(data[0])
        setDevices((prev) => [...prev, newDevice])
      }

      setError(null)
    } catch (err: any) {
      console.error("Error adding device:", err)
      setError(err.message || "Failed to add device")
    } finally {
      setLoading(false)
    }
  }

  const updateDevice = async (id: string, updatedDevice: Partial<Device>) => {
    try {
      setLoading(true)

      if (!supabaseConfigured || isUsingMockData || needsTableSetup) {
        // Update mock data
        setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...updatedDevice } : device)))
        setError(null)
        return
      }

      const dbDevice = mapDeviceToDbDevice(updatedDevice)
      const { error } = await supabase.from("devices").update(dbDevice).eq("id", id)

      if (error) {
        if (isTableMissingError(error)) {
          // Silently fall back to mock data
          setNeedsTableSetup(true)
          setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...updatedDevice } : device)))
          setError(null)
          return
        }
        throw error
      }

      setDevices((prev) => prev.map((device) => (device.id === id ? { ...device, ...updatedDevice } : device)))
      setError(null)
    } catch (err: any) {
      console.error("Error updating device:", err)
      setError(err.message || "Failed to update device")
    } finally {
      setLoading(false)
    }
  }

  const deleteDevice = async (id: string) => {
    try {
      setLoading(true)

      if (!supabaseConfigured || isUsingMockData || needsTableSetup) {
        // Delete from mock data
        setDevices((prev) => prev.filter((device) => device.id !== id))
        setError(null)
        return
      }

      const { error } = await supabase.from("devices").delete().eq("id", id)

      if (error) {
        if (isTableMissingError(error)) {
          // Silently fall back to mock data
          setNeedsTableSetup(true)
          setDevices((prev) => prev.filter((device) => device.id !== id))
          setError(null)
          return
        }
        throw error
      }

      setDevices((prev) => prev.filter((device) => device.id !== id))
      setError(null)
    } catch (err: any) {
      console.error("Error deleting device:", err)
      setError(err.message || "Failed to delete device")
    } finally {
      setLoading(false)
    }
  }

  const getDevicesByType = (type: DeviceType) => {
    return devices.filter((device) => device.type === type)
  }

  const getDevicesByStatus = (status: DeviceStatus) => {
    return devices.filter((device) => device.status === status)
  }

  const getDevicesByEmployee = (employeeName: string) => {
    return devices.filter((device) => device.assignedTo === employeeName)
  }

  const getEmployeeList = () => {
    const employees = devices
      .filter((device) => device.assignedTo && device.assignedTo.trim() !== "")
      .map((device) => device.assignedTo)
    return [...new Set(employees)].sort()
  }

  const getDeviceCount = () => devices.length

  const getDeviceCountByType = (type: DeviceType) => {
    return devices.filter((device) => device.type === type).length
  }

  const getDeviceCountByStatus = (status: DeviceStatus) => {
    return devices.filter((device) => device.status === status).length
  }

  const getEmployeeDeviceCount = (employeeName: string) => {
    return devices.filter((device) => device.assignedTo === employeeName).length
  }

  return (
    <DeviceContext.Provider
      value={{
        devices,
        loading,
        error,
        isUsingMockData,
        needsTableSetup,
        addDevice,
        updateDevice,
        deleteDevice,
        getDevicesByType,
        getDevicesByStatus,
        getDevicesByEmployee,
        getEmployeeList,
        getDeviceCount,
        getDeviceCountByType,
        getDeviceCountByStatus,
        getEmployeeDeviceCount,
        refreshDevices,
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export function useDevices() {
  const context = useContext(DeviceContext)
  if (context === undefined) {
    throw new Error("useDevices must be used within a DeviceProvider")
  }
  return context
}
