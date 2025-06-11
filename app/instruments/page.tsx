import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL) ;
  console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle errors if necessary
          }
        },
      },
    }
  )

  console.log('Supabase client created:', supabase);

  return supabase
}

// Wrap the insertion logic in an async function
async function insertData() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('instruments')
    .insert([
      { 
        device_name: 'Device 1', 
        device_type: 'Type A', 
        model_number: 'Model 123', 
        serial_number: 'SN123456', 
        assigned_to: 'User 1' 
      }
    ]);

  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Inserted data:', data);
  }
}

// Call the insert function
insertData();