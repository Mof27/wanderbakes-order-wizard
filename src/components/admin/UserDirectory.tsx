
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { User, Users, Info, Plus } from "lucide-react";
import { AppRole } from "@/services/supabase/database.types";
import { Textarea } from "@/components/ui/textarea";

interface SimpleUser {
  id: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  roles: AppRole[];
}

const UserDirectory = () => {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [manualNotes, setManualNotes] = useState("");

  useEffect(() => {
    fetchSimpleUserData();
  }, []);

  const fetchSimpleUserData = async () => {
    try {
      console.log("Fetching simple user data...");
      
      // Get all profiles - simple query
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Get all user roles - simple query
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
      }

      // Simple mapping - just display what we have
      const userList: SimpleUser[] = (profiles || []).map(profile => ({
        id: profile.id,
        display_name: profile.display_name,
        first_name: profile.first_name,
        last_name: profile.last_name,
        created_at: profile.created_at,
        roles: (userRoles || [])
          .filter(role => role.user_id === profile.id)
          .map(role => role.role)
      }));

      console.log("Simple user data loaded:", userList);
      setUsers(userList);
    } catch (error) {
      console.error("Error in fetchSimpleUserData:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatUserName = (user: SimpleUser) => {
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
            Simple User Directory - Text Display Only
          </CardTitle>
          <CardDescription className="text-blue-700">
            This shows basic user information from the database as simple text. No verification or complex logic.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="text-sm">
            This displays whatever is found in the profiles and user_roles tables. 
            Use the manual notes section below to track additional users or information.
          </p>
        </CardContent>
      </Card>

      {/* Manual Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Manual User Notes
          </CardTitle>
          <CardDescription>
            Add manual notes about users for your own tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any manual notes about users here (e.g., known users not showing up in database, additional info, etc.)"
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Simple User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Database Users ({users.length})
          </CardTitle>
          <CardDescription>
            Simple text display of users found in profiles table
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No users found in profiles table.
              </p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatUserName(user)}
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
                    
                    <div className="text-sm text-muted-foreground space-y-1 ml-11">
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Created:</strong> {formatDate(user.created_at)}</p>
                      {user.first_name && (
                        <p><strong>First Name:</strong> {user.first_name}</p>
                      )}
                      {user.last_name && (
                        <p><strong>Last Name:</strong> {user.last_name}</p>
                      )}
                      {user.display_name && (
                        <p><strong>Display Name:</strong> {user.display_name}</p>
                      )}
                    </div>
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
