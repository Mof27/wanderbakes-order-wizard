
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AuthStatus = () => {
  const { user, signOut, isConfigured } = useAuth();
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
  const userInitial = userEmail.substring(0, 1).toUpperCase();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserIcon className="mr-2 h-4 w-4" />
          <span className="truncate max-w-[200px]">{userEmail}</span>
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

