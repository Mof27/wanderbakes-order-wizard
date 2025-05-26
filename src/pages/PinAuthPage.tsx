
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, User, ArrowLeft, Shield, RefreshCw, AlertCircle } from "lucide-react";
import { useDataService } from "@/hooks/useDataService";
import { Skeleton } from "@/components/ui/skeleton";

interface PinUser {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
}

const PinAuthPage = () => {
  const { user, verifyPin, setUserSession } = useAuth();
  const { isReady, error: serviceError, retry } = useDataService();
  const navigate = useNavigate();
  const [pinUsers, setPinUsers] = useState<PinUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Fetch PIN users when data service is ready
  useEffect(() => {
    if (!isReady) {
      console.log("PinAuthPage: Data service not ready yet, waiting...");
      return;
    }

    fetchPinUsers();
  }, [isReady]);

  const fetchPinUsers = async () => {
    if (!isReady) {
      console.log("PinAuthPage: Data service not ready, cannot fetch users");
      return;
    }

    try {
      setLoadingUsers(true);
      setFetchError(null);
      console.log("PinAuthPage: Fetching PIN users from Supabase...");
      
      // Fetch all profiles that have a pin_hash (these are PIN users)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, display_name, pin_hash')
        .not('pin_hash', 'is', null); // Only get users who have a PIN hash
      
      if (error) {
        console.error('PinAuthPage: Error fetching PIN users:', error);
        setFetchError(`Failed to load PIN users: ${error.message}`);
        return;
      }
      
      console.log('PinAuthPage: Found profiles with PIN hash:', profiles);
      
      // Map the profiles to PIN users
      const users: PinUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        display_name: profile.display_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        first_name: profile.first_name || '',
        last_name: profile.last_name || ''
      }));
      
      console.log('PinAuthPage: Mapped PIN users:', users);
      setPinUsers(users);
      
      if (users.length === 0) {
        console.log('PinAuthPage: No PIN users found in database');
        setFetchError('No PIN users found. You may need to reset the admin profile.');
      }
    } catch (error) {
      console.error('PinAuthPage: Error in fetchPinUsers:', error);
      setFetchError('An error occurred while loading PIN users. Please try again.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRetryFetch = () => {
    console.log("PinAuthPage: Retrying user fetch");
    fetchPinUsers();
  };

  const handleRetryService = async () => {
    console.log("PinAuthPage: Retrying data service initialization");
    await retry();
  };

  const handlePinSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    
    if (pin.length !== 6) {
      toast.error("Please enter a 6-digit PIN");
      return;
    }

    setLoading(true);
    
    try {
      console.log("PinAuthPage: Attempting PIN authentication for user:", selectedUserId);
      
      // First verify the PIN
      const isValidPin = await verifyPin(selectedUserId, pin);
      
      if (isValidPin) {
        console.log("PinAuthPage: PIN verified successfully");
        
        // If PIN is valid, set the user session
        const { success, error } = await setUserSession(selectedUserId);
        
        if (success) {
          toast.success("Successfully signed in!");
          navigate("/");
        } else {
          console.error("PinAuthPage: Failed to set user session:", error);
          toast.error("Failed to sign in. Please try again.");
          setPin("");
        }
      } else {
        console.log("PinAuthPage: PIN verification failed");
        toast.error("Invalid PIN. Please try again.");
        setPin("");
      }
    } catch (error) {
      console.error("PinAuthPage: PIN authentication error:", error);
      toast.error("Authentication failed. Please try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/auth");
  };

  // Show service initialization error
  if (serviceError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Service Error</CardTitle>
            <CardDescription className="text-center">
              Failed to initialize data service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{serviceError}</p>
            </div>
            <Button onClick={handleRetryService} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Initialization
            </Button>
            <Button variant="ghost" onClick={handleBackToLogin} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Email Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Helmet>
        <title>PIN Authentication | WanderBakes</title>
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">PIN Authentication</CardTitle>
          <CardDescription className="text-center">
            Select your profile and enter your 6-digit PIN
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isReady && (
            <div className="space-y-3">
              <div className="text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Initializing data service...</p>
              </div>
            </div>
          )}

          {isReady && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                {loadingUsers ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {pinUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{user.display_name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {fetchError && (
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 mb-2">{fetchError}</p>
                      <div className="flex gap-2">
                        <Button onClick={handleRetryFetch} variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Retry
                        </Button>
                        <Button 
                          onClick={() => navigate("/admin-reset")}
                          variant="outline"
                          size="sm"
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!loadingUsers && !fetchError && pinUsers.length === 0 && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      No PIN users found. If you're the system administrator, you may need to reset the admin profile.
                    </p>
                    <Button 
                      onClick={() => navigate("/admin-reset")}
                      variant="outline"
                      className="w-full"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Reset
                    </Button>
                  </div>
                )}
                
                {!loadingUsers && pinUsers.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Found {pinUsers.length} PIN user{pinUsers.length === 1 ? '' : 's'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Enter PIN</label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={pin} 
                    onChange={setPin}
                    disabled={loading || !selectedUserId}
                  >
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
              </div>

              <Button 
                onClick={handlePinSubmit} 
                disabled={loading || !selectedUserId || pin.length !== 6 || loadingUsers}
                className="w-full"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </Button>
            </>
          )}

          <Button 
            variant="ghost" 
            onClick={handleBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Email Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PinAuthPage;
