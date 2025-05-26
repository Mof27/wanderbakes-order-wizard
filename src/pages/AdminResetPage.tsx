
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Shield, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminResetPage = () => {
  const [loading, setLoading] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleForceLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear all possible auth states
      localStorage.clear();
      sessionStorage.clear();
      
      // Sign out from Supabase
      await signOut();
      
      // Additional cleanup
      await supabase.auth.signOut();
      
      toast.success('Logged out successfully. You can now use PIN login.');
      
      // Small delay then redirect to PIN login
      setTimeout(() => {
        navigate('/pin-login');
      }, 1000);
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error during logout, but local session cleared');
      navigate('/pin-login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleAdminReset = async () => {
    setLoading(true);
    
    try {
      console.log("Calling set-admin function...");
      
      const { data, error } = await supabase.functions.invoke('set-admin', {
        body: {}
      });
      
      if (error) {
        console.error('Error calling set-admin function:', error);
        toast.error(`Failed to reset admin: ${error.message}`);
        return;
      }
      
      console.log('Set-admin response:', data);
      
      if (data.success) {
        setResetCompleted(true);
        toast.success(`Admin reset successful! You can now login with PIN: ${data.pin}`);
      } else {
        toast.error(data.error || 'Failed to reset admin');
      }
    } catch (error) {
      console.error('Error in admin reset:', error);
      toast.error('An unexpected error occurred during admin reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Admin Reset | WanderBakes</title>
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Reset</CardTitle>
          <CardDescription className="text-center">
            Reset the admin profile to fix authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                You're currently logged in with email/password. For PIN login to work properly, you need to logout first.
              </p>
              <Button 
                onClick={handleForceLogout} 
                disabled={loggingOut}
                variant="outline"
                className="w-full"
              >
                {loggingOut ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Force Logout
                  </>
                )}
              </Button>
            </div>
          )}

          {!resetCompleted ? (
            <>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>This will:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fix the PIN hash format (convert to MD5)</li>
                  <li>Set display name to "RAI - SUPER ADMIN"</li>
                  <li>Reset PIN to default (123456)</li>
                  <li>Clear any authentication locks</li>
                  <li>Ensure admin role is properly assigned</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleAdminReset} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Reset Admin Profile
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2">Reset Successful!</h3>
                <p className="text-sm text-green-700 mb-3">
                  Your admin profile has been reset with the correct hash format. You can now login using PIN authentication.
                </p>
                <div className="bg-green-100 p-3 rounded border">
                  <p className="text-sm font-medium text-green-800">Default PIN: 123456</p>
                  <p className="text-xs text-green-600 mt-1">
                    Profile: "RAI - SUPER ADMIN" should now appear in the PIN login dropdown
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/pin-login')}
                className="w-full"
              >
                Go to PIN Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminResetPage;
