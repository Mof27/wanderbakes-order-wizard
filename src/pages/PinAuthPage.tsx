import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { supabase } from "@/services/supabase/client";
import { config } from "@/config";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  is_pin_only?: boolean;
}

const PinAuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [error, setError] = useState("");
  const { user, isConfigured } = useAuth();
  const navigate = useNavigate();

  // Fetch available profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Load profiles from Supabase with join to auth.users to find PIN-only users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, display_name");
        
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return;
        }
        
        // Get user metadata to identify PIN-only users
        const { data: usersData, error: usersError } = await supabase.rpc('admin_get_users');
        
        if (usersError) {
          console.error("Error fetching users:", usersError);
        }
        
        // Combine data to identify PIN-only users
        if (profiles && usersData) {
          const enrichedProfiles = profiles.map(profile => {
            const userData = usersData.find(u => u.id === profile.id);
            const isPinOnly = userData?.raw_user_meta_data?.is_pin_only === true || 
                              userData?.raw_app_meta_data?.provider === 'pin' ||
                              userData?.email?.endsWith('@pin-user.local');
            
            return {
              ...profile,
              is_pin_only: isPinOnly
            };
          });
          
          // Sort to put PIN-only users first
          enrichedProfiles.sort((a, b) => {
            if (a.is_pin_only && !b.is_pin_only) return -1;
            if (!a.is_pin_only && b.is_pin_only) return 1;
            return 0;
          });
          
          setProfiles(enrichedProfiles);
        }
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      }
    };

    if (isConfigured) {
      fetchProfiles();
    }
  }, [isConfigured]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handlePinLogin = async () => {
    if (!selectedUserId) {
      setError("Please select a user profile first");
      return;
    }

    if (pin.length !== 6) {
      setError("Please enter a 6-digit PIN");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call our edge function to verify PIN and get a session token
      const supabaseUrl = config.supabase.url;
      const supabaseKey = config.supabase.anonKey;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/pin-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
          userId: selectedUserId,
          pin: pin
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || "Authentication failed");
      }
      
      if (result.success) {
        // Set the session in Supabase client
        const { session } = result;
        
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        });
        
        if (sessionError) {
          console.error("Error setting session:", sessionError);
          throw new Error("Failed to establish session");
        }
        
        toast.success("PIN verified successfully! Logging you in...");
        navigate("/");
      } else {
        setError(result.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    toast.success("Demo login successful!");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Helmet>
        <title>PIN Login | WanderBakes</title>
      </Helmet>
      
      <Card className="w-full max-w-md">
        {!isConfigured && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase Not Configured</AlertTitle>
            <AlertDescription>
              The Supabase connection is not properly configured. You can use the demo login below for testing.
            </AlertDescription>
          </Alert>
        )}

        {!isConfigured ? (
          <>
            <CardHeader>
              <CardTitle>Demo Login</CardTitle>
              <CardDescription>
                This is a demo version as Supabase is not configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDemoLogin} className="w-full">
                Continue as Demo User
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="mr-2 h-5 w-5" /> PIN Login
              </CardTitle>
              <CardDescription>
                Select your profile and enter your 6-digit PIN
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="user-select">Select Your Profile</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger id="user-select" className="w-full">
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id} className="flex items-center">
                        {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`}
                        {profile.is_pin_only && (
                          <Badge className="ml-2 bg-green-500 text-xs">PIN</Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pin-input">Enter PIN</Label>
                <InputOTP maxLength={6} value={pin} onChange={setPin}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button
                onClick={handlePinLogin}
                className="w-full"
                disabled={loading || !selectedUserId || pin.length !== 6}
              >
                {loading ? "Verifying..." : "Login"}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default PinAuthPage;
