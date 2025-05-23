
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent } from "@/components/ui/card";

const UserManagementPage = () => {
  const navigate = useNavigate();
  
  // Redirect to the unified admin/users page
  useEffect(() => {
    navigate("/admin/users", { replace: true });
  }, [navigate]);
  
  // Show a loading state while redirecting
  return (
    <div className="container py-8">
      <Helmet>
        <title>Redirecting... | WanderBakes</title>
      </Helmet>
      
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p>Redirecting to User Management...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
