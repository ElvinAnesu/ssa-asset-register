import { createClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

// Type helper for database tables
export type Tables = {
  devices: {
    Row: {
      id: string
      created_at: string
      device_name: string
      device_type: string
      model_number: string
      serial_number: string
      assigned_to: string | null
      status: string
    }
    Insert: {
      id?: string
      device_name: string
      device_type: string
      model_number: string
      serial_number: string
      assigned_to?: string | null
      status: string
    }
    Update: {
      id?: string
      device_name?: string
      device_type?: string
      model_number?: string
      serial_number?: string
      assigned_to?: string | null
      status?: string
    }
  }
}

// For client components (singleton pattern)
let clientInstance: ReturnType<typeof createClient> | null = null

export const createSupabaseClient = () => {
  if (clientInstance) return clientInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are required. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  clientInstance = createClient(supabaseUrl, supabaseAnonKey)
  return clientInstance
}

// For server components
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Supabase server environment variables not found.")
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
