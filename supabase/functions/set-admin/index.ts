
// Follow this setup guide to integrate the Supabase's Edge Functions with your app:
// https://supabase.com/docs/guides/functions/edge-functions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This is a one-time setup function to create the first admin user
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
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // User ID for rainaldo27@hotmail.com
    const userId = "3af8c4fb-1ed3-4c43-ab6d-14f6ab41162f";
    
    // Set a default PIN (123456) - can be changed later through the admin interface
    const pin = "123456";
    
    // Step 1: Hash the PIN
    const { data: pinHash, error: hashError } = await supabaseClient.rpc(
      "hash_pin",
      { pin }
    );

    if (hashError) {
      console.error("Error hashing PIN:", hashError);
      return new Response(
        JSON.stringify({ error: "PIN hashing failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Step 2: Assign the admin role
    const { error: roleError } = await supabaseClient
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });

    if (roleError) {
      console.error("Error assigning admin role:", roleError);
      return new Response(
        JSON.stringify({ error: "Failed to assign admin role" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Step 3: Update the user's profile with PIN hash and display name
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .update({ 
        pin_hash: pinHash,
        display_name: "Admin User",
        failed_pin_attempts: 0,
        locked_until: null
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Error updating profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to update user profile" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // All operations completed successfully
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin user created successfully",
        pin: pin, // Include the PIN in the response so you know what to use
        user_id: userId
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
