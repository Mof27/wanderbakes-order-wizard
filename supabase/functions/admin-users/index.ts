
// Follow this setup guide to integrate the Supabase's Edge Functions with your app:
// https://supabase.com/docs/guides/functions/edge-functions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Set CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Parse the request
    const body = await req.json();
    const { userId, action, userData } = body;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Admin action request: ${action} from user:`, userId);

    // First, verify the user making the request has admin role
    const { data: userRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      return new Response(
        JSON.stringify({ error: "Failed to verify admin permission" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const isAdmin = (userRoles || []).some(role => role.role === 'admin');
    if (!isAdmin) {
      console.log("Access denied: User is not an admin", { roles: userRoles });
      return new Response(
        JSON.stringify({ error: "Not authorized. Admin role required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    console.log("Admin access verified for user:", userId);

    // Handle different admin actions
    if (action === 'getUsers') {
      // Get all auth users directly with the service role
      const { data: authUsers, error: authError } = await supabaseAdmin
        .from('auth.users')
        .select('*');

      if (authError) {
        console.error("Error fetching auth users:", authError);
        
        // Fallback: Get all users from profiles table instead
        console.log("Attempting fallback to profiles table");
        const { data: profiles, error: profilesError } = await supabaseAdmin
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch users" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        // Get user roles
        const { data: allRoles, error: allRolesError } = await supabaseAdmin
          .from('user_roles')
          .select('*');
          
        if (allRolesError) {
          console.error("Error fetching roles:", allRolesError);
        }
        
        // Return just the profiles data
        return new Response(
          JSON.stringify({ 
            profiles: profiles || [], 
            roles: allRoles || [] 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
      
      // If we successfully got auth users, also get profiles and roles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }
      
      // Get all roles
      const { data: allRoles, error: allRolesError } = await supabaseAdmin
        .from('user_roles')
        .select('*');
        
      if (allRolesError) {
        console.error("Error fetching roles:", allRolesError);
      }
      
      // Return all data
      return new Response(
        JSON.stringify({ 
          auth_users: authUsers || [], 
          profiles: profiles || [],
          roles: allRoles || []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } 
    else if (action === 'createPinUser') {
      // Create a new PIN-only user with a corresponding auth user entry
      if (!userData) {
        return new Response(
          JSON.stringify({ error: "User data is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      const { first_name, last_name, display_name, pin, roles } = userData;
      
      if (!first_name || !last_name || !pin || !roles || !roles.length) {
        return new Response(
          JSON.stringify({ error: "Missing required user data" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      try {
        console.log("Creating new PIN user with data:", {
          first_name,
          last_name,
          display_name: display_name || `${first_name} ${last_name}`,
          roles
        });
        
        // Instead of using auth.admin.createUser which might be having issues,
        // we'll use the database create_pin_user function to create the user directly
        const { data: newUserId, error: createUserError } = await supabaseAdmin.rpc(
          "create_pin_user",
          { 
            first_name, 
            last_name, 
            display_name: display_name || `${first_name} ${last_name}`,
            pin,
            roles
          }
        );

        if (createUserError) {
          console.error("Error creating PIN user:", createUserError);
          return new Response(
            JSON.stringify({ error: `Failed to create PIN user: ${createUserError.message}` }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            userId: newUserId,
            message: "PIN user created successfully" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } catch (error) {
        console.error("Error creating PIN user:", error);
        return new Response(
          JSON.stringify({ error: `Failed to create PIN user: ${error.message}` }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }
    else {
      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
