
// This function sets up admin functions for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Use the environment variables automatically provided by Supabase Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Read and execute the admin_get_users.sql file
const adminGetUsersSql = await Deno.readTextFile('./functions/admin_get_users.sql')

async function setupAdminFunctions() {
  try {
    // Execute the admin functions SQL
    const { error } = await supabase.rpc('admin_get_users')
    
    if (error) {
      // Create the function if it doesn't exist
      const { error: createError } = await supabase.sql(adminGetUsersSql)
      
      if (createError) {
        console.error('Failed to create admin function:', createError)
        return { error: createError }
      } else {
        console.log('Successfully created admin function')
        return { success: true }
      }
    } else {
      console.log('Admin function already exists')
      return { success: true }
    }
  } catch (error) {
    console.error('Error setting up admin functions:', error)
    return { error }
  }
}

// Execute the setup
await setupAdminFunctions()
