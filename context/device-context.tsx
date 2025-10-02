"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

export type DeviceType = "Computer" | "Laptop" | "Printer" | "Scanner" | "SIM Card" | "Office Phone" | "Router" | "Pocket Wifi" | "UPS"
export type DeviceStatus = "Active" | "Available" | "Maintenance" | "Inactive"

export interface Device {
  id: string
  type: DeviceType
  serialNumber: string
  modelNumber?: string
  assignedTo: string
  status: DeviceStatus
  dateAssigned: string | null
  notes?: string
  department?: string
  warranty?: string
}

interface DeviceContextType {
  devices: Device[]
  loading: boolean
  error: string | null
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


export function DeviceProvider({ children }: { children: React.ReactNode }) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    department: dbDevice.department || "",
    warranty: dbDevice.warranty || "",
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
    if (device.department !== undefined) dbDevice.department = device.department || null
    if (device.warranty !== undefined) dbDevice.warranty = device.warranty || null
    return dbDevice
  }

  // Fetch devices from Supabase
  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.from("devices").select("*")

      if (error) {
        throw error
      }

      const mappedDevices = data.map(mapDbDeviceToDevice)
      setDevices(mappedDevices)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching devices:", err)
      setError(err.message || "Failed to fetch devices from database")
    } finally {
      setLoading(false)
    }
  }

  // Load devices on mount
  useEffect(() => {
    fetchDevices()

    // Set up real-time subscription
    const subscription = supabase
      .channel("devices-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "devices" }, () => {
        fetchDevices()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshDevices = async () => {
    await fetchDevices()
  }

  const addDevice = async (device: Omit<Device, "id">) => {
    try {
      setLoading(true)
      setError(null)

      const dbDevice = mapDeviceToDbDevice(device)
      const { data, error } = await supabase.from("devices").insert(dbDevice).select()

      if (error) {
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
      setError(null)

      const dbDevice = mapDeviceToDbDevice(updatedDevice)
      const { error } = await supabase.from("devices").update(dbDevice).eq("id", id)

      if (error) {
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
      setError(null)

      const { error } = await supabase.from("devices").delete().eq("id", id)

      if (error) {
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
    const normalizedType = type.trim().toLowerCase();
    return devices.filter((device) => device.type && device.type.trim().toLowerCase() === normalizedType);
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
    const normalizedType = type.trim().toLowerCase();
    return devices.filter((device) => device.type && device.type.trim().toLowerCase() === normalizedType).length;
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
