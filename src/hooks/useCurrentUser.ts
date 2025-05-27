
import { useAuth } from "@/context/AuthContext";

export const useCurrentUser = () => {
  const { user, profile } = useAuth();
  
  const getCurrentUserDisplayName = (): string => {
    if (!user || !profile) {
      return "System";
    }
    
    return profile.display_name || profile.first_name || "Unknown User";
  };
  
  return {
    user,
    profile,
    getCurrentUserDisplayName,
    isAuthenticated: !!user
  };
};
