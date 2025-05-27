
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { User, Users, Info, AlertCircle } from "lucide-react";
import { AppRole } from "@/services/supabase/database.types";

interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  created_at: string;
  roles: AppRole[];
  has_profile: boolean;
}

const UserDirectory = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching comprehensive user directory...");
      setError(null);
      
      // Get all auth users (requires admin privileges)
      const { data: authUsers, error: authError } = await supabase.rpc('admin_get_users');
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        // Fallback to profiles only if auth fetch fails
        await fetchProfilesOnly();
        return;
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Combine auth users with profiles and roles
      const userList: UserProfile[] = (authUsers || []).map(authUser => {
        const profile = (profiles || []).find(p => p.id === authUser.id);
        const userRolesList = (userRoles || [])
          .filter(role => role.user_id === authUser.id)
          .map(role => role.role);

        return {
          id: authUser.id,
          email: authUser.email,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          display_name: profile?.display_name,
          created_at: authUser.created_at || profile?.created_at || new Date().toISOString(),
          roles: userRolesList,
          has_profile: !!profile
        };
      });

      console.log("Loaded comprehensive user directory:", userList);
      setUsers(userList);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setError("Failed to fetch user data. Please try refreshing the page.");
      // Fallback to profiles only
      await fetchProfilesOnly();
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilesOnly = async () => {
    try {
      console.log("Fetching profiles-only user directory...");
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }

      // Get all user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Map profiles to user list
      const userList: UserProfile[] = (profiles || []).map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        created_at: profile.created_at,
        roles: (userRoles || [])
          .filter(role => role.user_id === profile.id)
          .map(role => role.role),
        has_profile: true
      }));

      console.log("Loaded profiles-only user directory:", userList);
      setUsers(userList);
    } catch (error) {
      console.error("Error in fetchProfilesOnly:", error);
      setError("Failed to fetch user data. Please try refreshing the page.");
    }
  };

  const formatUserName = (user: UserProfile) => {
    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    if (user.email) return user.email.split('@')[0];
    return 'Unnamed User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            User Management Instructions
          </CardTitle>
          <CardDescription className="text-blue-700">
            This is a view-only directory of system users. To add users, modify roles, or make changes:
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-700">
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Tell the AI what changes you need (e.g., "Add user John with admin role")</li>
            <li>Review and approve the SQL commands provided</li>
            <li>Changes will appear immediately after running the SQL</li>
          </ol>
          <p className="mt-3 text-xs">
            This approach ensures reliable user management and gives you full control over the process.
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Directory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users ({users.length})
          </CardTitle>
          <CardDescription>
            Current users and their assigned roles in the WanderBakes system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No users found in the system.
              </p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatUserName(user)}
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>ID: {user.id.substring(0, 8)}... • Created: {formatDate(user.created_at)}</p>
                        {user.email && (
                          <p>Email: {user.email}</p>
                        )}
                        {!user.has_profile && (
                          <p className="text-amber-600 font-medium">⚠️ No profile entry</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="secondary" size="sm">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" size="sm">
                        No roles
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDirectory;
