"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, Database, Wifi, Shield, ExternalLink, Copy } from "lucide-react"
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase"

interface SupabaseStatusProps {
  onClose?: () => void
}

export function SupabaseStatus({ onClose }: SupabaseStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [tableExists, setTableExists] = useState<boolean | null>(null)
  const [recordCount, setRecordCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSupabaseStatus()
  }, [])

  const checkSupabaseStatus = async () => {
    try {
      setConnectionStatus("checking")

      if (!isSupabaseConfigured()) {
        setConnectionStatus("error")
        setTableExists(false)
        setError("Environment variables not configured")
        return
      }

      const supabase = createSupabaseClient()

      // Test connection by trying to fetch from devices table
      const { data, error: fetchError } = await supabase.from("devices").select("id").limit(1)

      if (fetchError) {
        setConnectionStatus("error")

        // Check if it's a table missing error
        if (
          fetchError.message?.includes('relation "public.devices" does not exist') ||
          fetchError.message?.includes('table "devices" does not exist') ||
          fetchError.code === "PGRST116"
        ) {
          setTableExists(false)
          setError("Database table 'devices' does not exist. Please run the setup scripts.")
        } else {
          setTableExists(null)
          setError(fetchError.message)
        }
        return
      }

      setConnectionStatus("connected")
      setTableExists(true)

      // Get record count
      const { count } = await supabase.from("devices").select("*", { count: "exact", head: true })

      setRecordCount(count || 0)
      setError(null)
    } catch (err: any) {
      setConnectionStatus("error")
      setError(err.message)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "connected":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600 animate-pulse" />
    }
  }

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Checking...</Badge>
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const sqlScript = `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  assigned_to VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  date_assigned DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_devices_type ON devices(type);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);
CREATE INDEX IF NOT EXISTS idx_devices_assigned_to ON devices(assigned_to);

-- Enable Row Level Security (RLS)
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations" ON devices FOR ALL USING (true);`

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle className="text-lg">Supabase Database Status</CardTitle>
          </div>
          {getStatusIcon()}
        </div>
        <CardDescription>Real-time connection status for SSA Logistics database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              <span className="text-sm font-medium">Connection Status</span>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="text-sm font-medium">Database Table</span>
            </div>
            {tableExists === null ? (
              <Badge variant="secondary">Checking...</Badge>
            ) : tableExists ? (
              <Badge className="bg-green-100 text-green-800">Ready</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">Missing</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Environment Config</span>
            </div>
            {isSupabaseConfigured() ? (
              <Badge className="bg-green-100 text-green-800">Configured</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">Missing</Badge>
            )}
          </div>

          {recordCount !== null && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm font-medium">Records Count</span>
              </div>
              <Badge variant="outline">{recordCount} devices</Badge>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 font-medium">Error Details:</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {tableExists === false && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800 font-medium">Setup Required:</p>
              <p className="text-sm text-amber-600 mt-1">
                Your Supabase project is connected, but the 'devices' table doesn't exist. Run the SQL script below in
                your Supabase SQL Editor.
              </p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">SQL Setup Script:</p>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(sqlScript)}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs text-gray-600 overflow-x-auto max-h-32">{sqlScript}</pre>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Supabase
              </Button>
              <Button variant="outline" size="sm" onClick={checkSupabaseStatus}>
                Retry Connection
              </Button>
            </div>
          </div>
        )}

        {!isSupabaseConfigured() && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium">Environment Setup Required:</p>
              <p className="text-sm text-blue-600 mt-1">Create a .env.local file with your Supabase credentials.</p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Environment Variables:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `NEXT_PUBLIC_SUPABASE_URL=your_project_url\nNEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`,
                    )
                  }
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
              <pre className="text-xs text-gray-600">
                {`NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
            </div>

            <Button variant="outline" size="sm" onClick={() => window.open("https://supabase.com", "_blank")}>
              <ExternalLink className="h-3 w-3 mr-1" />
              Get Started with Supabase
            </Button>
          </div>
        )}

        {connectionStatus === "connected" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">✅ Database Ready!</p>
            <p className="text-sm text-green-600 mt-1">Your Supabase database is properly configured and connected.</p>
          </div>
        )}

        {onClose && (
          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
