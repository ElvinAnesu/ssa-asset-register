"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { Tables } from "@/lib/supabase"
import { toast } from "sonner"

type Device = Tables['devices']['Row']
type DeviceUpdate = Tables['devices']['Update']

export default function EditDevicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [device, setDevice] = useState<Device | null>(null)
  const [formData, setFormData] = useState<DeviceUpdate>({
    device_name: "",
    device_type: "",
    model_number: "",
    serial_number: "",
    status: "Available",
    assigned_to: null
  })

  useEffect(() => {
    fetchDevice()
  }, [params.id])

  const fetchDevice = async () => {
    try {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      setDevice(data)
      setFormData({
        device_name: data.device_name,
        device_type: data.device_type,
        model_number: data.model_number,
        serial_number: data.serial_number,
        status: data.status,
        assigned_to: data.assigned_to
      })
    } catch (error) {
      console.error('🔥 Error fetching device:', error)
      toast.error('Failed to fetch device')
      router.push('/dashboard/devices')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('devices')
        .update(formData)
        .eq('id', params.id)

      if (error) throw error

      toast.success('Device updated successfully')
      router.push('/dashboard/devices')
    } catch (error) {
      console.error('🔥 Error updating device:', error)
      toast.error('Failed to update device')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!device) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Device</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="device_name">Device Name</Label>
          <Input
            id="device_name"
            name="device_name"
            value={formData.device_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="device_type">Device Type</Label>
          <Input
            id="device_type"
            name="device_type"
            value={formData.device_type}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model_number">Model Number</Label>
          <Input
            id="model_number"
            name="model_number"
            value={formData.model_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serial_number">Serial Number</Label>
          <Input
            id="serial_number"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="In Use">In Use</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigned_to">Assigned To (Optional)</Label>
          <Input
            id="assigned_to"
            name="assigned_to"
            value={formData.assigned_to || ''}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Device'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/devices')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
} 