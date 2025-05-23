
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
    
    // Parse the request to get the user's authentication
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log("Admin users request from:", userId);

    // First, verify the user making the request has admin role
    // We need to do this check manually since we can't rely on RLS
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

    // Get all auth users directly with the service role
    const { data: authUsers, error: authError } = await supabaseAdmin
      .from('auth')
      .select('users');

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
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
