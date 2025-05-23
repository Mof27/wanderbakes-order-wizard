
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

    // If PIN is valid, get user details
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

    // Create a custom admin signed JWT token using the admin API
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.admin.createSession({
      userId: userId,
      // Set the session to expire in 24 hours
      expiresIn: 60 * 60 * 24
    });

    if (sessionError) {
      console.error("Error creating session:", sessionError);
      return new Response(
        JSON.stringify({ error: "Error creating authentication session" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Return the session data along with the user profile
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: userData,
        session: sessionData,
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
