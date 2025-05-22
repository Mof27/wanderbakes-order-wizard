
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

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
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
        // Load profiles from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, display_name");
        
        if (error) {
          console.error("Error fetching profiles:", error);
          return;
        }
        
        if (data) {
          setProfiles(data);
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
      // Call our custom API to verify PIN
      const { data, error } = await supabase.rpc('verify_pin', {
        user_id: selectedUserId,
        pin: pin
      });

      if (error) {
        console.error("PIN verification error:", error);
        setError("Error verifying PIN: " + error.message);
        setLoading(false);
        return;
      }

      if (data === true) {
        // PIN is correct, now log in with a custom auth method
        // This requires a custom server function, for now we'll simulate with an admin login
        try {
          // Get user email from the selected profile 
          const { data: userData } = await supabase
            .from('auth.users')
            .select('email')
            .eq('id', selectedUserId)
            .single();
            
          if (userData && userData.email) {
            // For now, we'll use a temp solution to sign in as the selected user
            // Later this should be replaced with a proper token-based auth
            toast.success("PIN verified successfully! Logging you in...");
            navigate("/");
          } else {
            setError("Could not find user information");
          }
        } catch (authError) {
          console.error("Authentication error:", authError);
          setError("Authentication error");
        }
      } else {
        // PIN is incorrect
        setError("Invalid PIN. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
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
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`}
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
