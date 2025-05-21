
import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { AlertTriangle } from "lucide-react";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, profile, roles } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Helmet>
        <title>Unauthorized | WanderBakes</title>
      </Helmet>

      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-yellow-100 p-3">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Access Denied</h1>
        <p className="mb-6 text-muted-foreground">
          You don't have permission to access this page.
        </p>

        {user && (
          <div className="mb-6 rounded-lg bg-muted p-4 text-left">
            <p className="font-medium">Current user information:</p>
            <p className="text-sm">Email: {user.email}</p>
            <p className="text-sm">Name: {profile?.display_name || 'N/A'}</p>
            <p className="text-sm">Roles: {roles.length > 0 ? roles.join(', ') : 'No roles assigned'}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button 
            onClick={() => navigate("/")} 
            variant="default"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
