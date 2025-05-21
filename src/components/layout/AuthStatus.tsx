
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, User as UserIcon, Shield, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const AuthStatus = () => {
  const { user, signOut, isConfigured, profile, roles, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If Supabase is not configured, show a button to go to the auth page
  if (!isConfigured) {
    return (
      <Button
        variant="outline"
        className="border-dashed"
        onClick={() => navigate("/auth")}
      >
        <LogIn className="mr-2 h-4 w-4" /> Demo Login
      </Button>
    );
  }
  
  // If user is not logged in, show login button
  if (!user) {
    return (
      <Button
        variant="outline"
        className="border-dashed"
        onClick={() => navigate("/auth")}
      >
        <LogIn className="mr-2 h-4 w-4" /> Sign In
      </Button>
    );
  }
  
  // If user is logged in, show user info
  const userEmail = user?.email || "";
  const displayName = profile?.display_name || profile?.first_name || "";
  const userInitial = displayName ? displayName.substring(0, 1).toUpperCase() : userEmail.substring(0, 1).toUpperCase();
  
  // Show different icon for admin users
  const AdminIcon = isAdmin() ? ShieldCheck : Shield;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {profile?.avatar_url && (
              <AvatarImage src={profile.avatar_url} alt={displayName || userEmail} />
            )}
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {displayName || 'User'}
              {isAdmin() && <Badge variant="outline" className="ml-2 bg-primary text-white">Admin</Badge>}
            </p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {roles.length > 0 && (
          <>
            <DropdownMenuLabel>
              <div className="flex items-center">
                <AdminIcon className="mr-2 h-4 w-4" />
                <span>Roles</span>
              </div>
            </DropdownMenuLabel>
            {roles.map(role => (
              <DropdownMenuItem key={role} disabled>
                <Badge variant="secondary" className="px-2 py-1">{role}</Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate("/auth");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthStatus;
