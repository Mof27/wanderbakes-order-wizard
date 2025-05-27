
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { User, Users, Info } from "lucide-react";
import { AppRole } from "@/services/supabase/database.types";

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  created_at: string;
  roles: AppRole[];
}

const UserDirectory = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("Fetching user directory...");
      
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

      // Combine profiles with roles
      const userList: UserProfile[] = (profiles || []).map(profile => ({
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        created_at: profile.created_at,
        roles: (userRoles || [])
          .filter(role => role.user_id === profile.id)
          .map(role => role.role)
      }));

      console.log("Loaded user directory:", userList);
      setUsers(userList);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatUserName = (user: UserProfile) => {
    if (user.display_name) return user.display_name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
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
                      <p className="text-sm text-muted-foreground">
                        ID: {user.id.substring(0, 8)}... • Created: {formatDate(user.created_at)}
                      </p>
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
