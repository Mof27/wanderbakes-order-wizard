
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppRole } from "@/services/supabase/database.types";
import { config } from "@/config"; // Import config

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
    if (config.debug.authEvents) {
      console.log("RoleGuard: No user found, redirecting to auth");
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Enhanced logging for debugging (conditional)
  if (config.debug.authEvents) {
    console.log("RoleGuard: Checking authorization:", {
      allowedRoles,
      userRoles: roles,
      userID: user.id,
      // userMeta: user.app_metadata || user.user_metadata, // Potentially sensitive, removed from default log
      // isPinAuth: user.id === localStorage.getItem("pin_auth_user_id"), // PIN auth specific, removed
      // pinAuthRoles: localStorage.getItem("pin_auth_roles"), // PIN auth specific, removed
    });
  }
  
  // Check for each allowed role
  for (const role of allowedRoles) {
    if (hasRole(role)) { // hasRole already logs conditionally if config.debug.authEvents is true
      if (config.debug.authEvents) {
        console.log(`RoleGuard: Role ${role} authorized, rendering protected content`);
      }
      return <>{children}</>;
    }
  }

  // If no allowed roles match, redirect to unauthorized page
  console.warn(`RoleGuard: Access denied for user ${user.email}. User roles: [${roles.join(', ')}], Required roles: [${allowedRoles.join(', ')}] for path ${location.pathname}`);
  return <Navigate to={redirectTo} replace />;
};

export default RoleGuard;
