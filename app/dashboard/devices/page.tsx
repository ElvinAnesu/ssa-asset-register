"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/lib/supabase"
import { toast } from "sonner"

type Device = Tables['devices']['Row']

export default function DevicesPage() {
  const router = useRouter()
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setDevices(data || [])
    } catch (error) {
      console.error('🔥 Error fetching devices:', error)
      toast.error('Failed to fetch devices')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('devices')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Device deleted successfully')
      fetchDevices()
    } catch (error) {
      console.error('🔥 Error deleting device:', error)
      toast.error('Failed to delete device')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Devices</h1>
        <Button onClick={() => router.push('/dashboard/devices/add')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Device
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-lg mb-2">{device.device_name}</h3>
              <p className="text-sm text-gray-600 mb-1">Type: {device.device_type}</p>
              <p className="text-sm text-gray-600 mb-1">Model: {device.model_number}</p>
              <p className="text-sm text-gray-600 mb-1">Serial: {device.serial_number}</p>
              <p className="text-sm text-gray-600 mb-1">Status: {device.status}</p>
              {device.assigned_to && (
                <p className="text-sm text-gray-600 mb-1">Assigned to: {device.assigned_to}</p>
              )}
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/devices/edit/${device.id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(device.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 