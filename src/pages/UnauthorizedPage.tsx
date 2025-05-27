
import React from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowLeft, Shield, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Helmet>
        <title>Unauthorized | WanderBakes</title>
      </Helmet>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-red-800">
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You don't have permission to access this page. Please sign in with an account 
            that has the required permissions or contact an administrator for access.
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => navigate("/")}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <Button 
              onClick={() => navigate("/auth")}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
            
            <Button 
              onClick={() => navigate("/admin-reset")}
              variant="ghost"
              className="w-full text-xs"
            >
              <Shield className="mr-2 h-3 w-3" />
              Admin Reset (if you're the system admin)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedPage;
