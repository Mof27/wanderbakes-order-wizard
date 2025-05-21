
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppRole } from "@/services/supabase/database.types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = "/unauthorized"
}) => {
  const { user, loading, hasRole } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has any of the allowed roles
  const hasPermission = allowedRoles.some(role => hasRole(role));

  // If user doesn't have required role, redirect to unauthorized page
  if (!hasPermission) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default RoleGuard;
