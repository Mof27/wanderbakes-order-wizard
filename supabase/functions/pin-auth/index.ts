
// Follow this setup guide to integrate the Supabase's Edge Functions with your app:
// https://supabase.com/docs/guides/functions/edge-functions

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PinAuthRequest {
  userId: string;
  pin: string;
}

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, pin } = await req.json() as PinAuthRequest;

    if (!userId || !pin) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verify the PIN using the database function
    const { data: isValid, error: verifyError } = await supabaseClient.rpc(
      "verify_pin",
      { user_id: userId, pin }
    );

    if (verifyError) {
      console.error("Error verifying PIN:", verifyError);
      return new Response(
        JSON.stringify({ error: "PIN verification failed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid PIN" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // If PIN is valid, get user details and create a session
    const { data: userData, error: userError } = await supabaseClient
      .from("profiles")
      .select("id, first_name, last_name, display_name")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "Error fetching user profile" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Generate a custom token for the user (in a real app, you'd use proper JWT)
    // Since we don't have easy access to create auth sessions with service role,
    // we'll return user info and the client will handle the session management

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData,
        message: "PIN verified successfully" 
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
