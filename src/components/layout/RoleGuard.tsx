
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
  const { user, loading, hasRole, roles } = useAuth();
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
    console.log("RoleGuard: No user found, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Enhanced logging for debugging
  console.log("RoleGuard checking authorization:", {
    allowedRoles,
    userRoles: roles,
    userID: user.id,
    userMeta: user.app_metadata || user.user_metadata,
    isPinAuth: user.id === localStorage.getItem("pin_auth_user_id"),
    pinAuthRoles: localStorage.getItem("pin_auth_roles"),
  });
  
  // Check for each allowed role
  for (const role of allowedRoles) {
    console.log(`Checking if user has role: ${role}`, hasRole(role));
    if (hasRole(role)) {
      // Render children if any allowed role is found
      console.log(`Role ${role} authorized, rendering protected content`);
      return <>{children}</>;
    }
  }

  // If no allowed roles match, redirect to unauthorized page
  console.warn("Access denied. User roles:", roles, "Required roles:", allowedRoles);
  return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;
