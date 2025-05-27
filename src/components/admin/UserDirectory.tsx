
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Users, Info, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface StaticUser {
  id: string;
  display_name: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  roles: string[];
}

const UserDirectory = () => {
  const [manualNotes, setManualNotes] = useState("");

  // Static user list based on known database users
  const staticUsers: StaticUser[] = [
    {
      id: "3af8c4fb-1ed3-4c43-ab6d-14f6ab41162f",
      display_name: "RAI - SUPER ADMIN",
      first_name: "RAI",
      last_name: "SUPER ADMIN",
      created_at: "2025-01-20T00:00:00Z",
      roles: ["admin"]
    },
    {
      id: "user-id-wanderbakes",
      display_name: "WanderBakes Admin",
      first_name: "WanderBakes",
      last_name: "Admin",
      created_at: "2025-01-20T00:00:00Z",
      roles: ["admin"]
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Static User Directory - Simple Text Display
          </CardTitle>
          <CardDescription className="text-blue-700">
            This shows a hardcoded list of known users as simple text. No database queries or complex logic.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="text-sm">
            This displays a static list of known users in the system. 
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
            placeholder="Add any manual notes about users here (e.g., additional users, contact info, special notes, etc.)"
            value={manualNotes}
            onChange={(e) => setManualNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Static User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Known Users ({staticUsers.length})
          </CardTitle>
          <CardDescription>
            Static list of users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staticUsers.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.display_name}
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
                    <p><strong>Display Name:</strong> {user.display_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDirectory;
