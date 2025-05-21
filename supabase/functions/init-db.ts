
// Edge function to initialize database with required functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Get environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Define the SQL for the admin_get_users function
const adminGetUsersSql = `
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the current user has the admin role
  IF (SELECT public.has_role('admin')) THEN
    RETURN QUERY SELECT * FROM auth.users;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only administrators can view all users';
  END IF;
END;
$$;
`

// Execute the function
async function initDatabase() {
  try {
    // Create the admin_get_users function
    const { error } = await supabase.sql(adminGetUsersSql)
    
    if (error) {
      console.error('Failed to create admin_get_users function:', error)
      return { success: false, error }
    }
    
    console.log('Database initialization completed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error initializing database:', error)
    return { success: false, error }
  }
}

// Execute the initialization
Deno.serve(async (_req) => {
  const result = await initDatabase()
  
  return new Response(
    JSON.stringify(result),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
