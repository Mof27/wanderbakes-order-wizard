import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, UserPlus, Shield } from "lucide-react";
import { AppRole } from "@/services/supabase/database.types";

interface Employee {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  roles: AppRole[];
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmployee, setNewEmployee] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: ""
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log("Fetching all employees...");
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Failed to load employees");
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
      const employeeList: Employee[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.id, // We'll show the ID as email for now
        first_name: profile.first_name,
        last_name: profile.last_name,
        display_name: profile.display_name,
        roles: (userRoles || [])
          .filter(role => role.user_id === profile.id)
          .map(role => role.role)
      }));

      console.log("Loaded employees:", employeeList);
      setEmployees(employeeList);
    } catch (error) {
      console.error("Error in fetchEmployees:", error);
      toast.error("Error loading employees");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newEmployee.email || !newEmployee.password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      console.log("Creating new employee:", newEmployee.email);
      
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newEmployee.email,
        password: newEmployee.password,
        user_metadata: {
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          display_name: newEmployee.first_name + " " + newEmployee.last_name
        },
        email_confirm: true // Auto-confirm email for admin-created accounts
      });

      if (authError) {
        console.error("Error creating user:", authError);
        toast.error("Failed to create employee account: " + authError.message);
        return;
      }

      console.log("Employee created successfully:", authData.user?.id);
      toast.success("Employee account created successfully!");
      
      // Reset form
      setNewEmployee({
        email: "",
        first_name: "",
        last_name: "",
        password: ""
      });
      
      // Refresh employee list
      await fetchEmployees();
      
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee account");
    }
  };

  const assignRole = async (employeeId: string, role: AppRole) => {
    try {
      console.log("Assigning role", role, "to employee", employeeId);
      
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: employeeId, role });
        
      if (error) {
        console.error("Error assigning role:", error);
        toast.error("Failed to assign role");
        return;
      }
      
      toast.success(`Assigned ${role} role successfully`);
      await fetchEmployees();
    } catch (error) {
      console.error("Error in assignRole:", error);
      toast.error("Failed to assign role");
    }
  };

  const removeRole = async (employeeId: string, role: AppRole) => {
    try {
      console.log("Removing role", role, "from employee", employeeId);
      
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', employeeId)
        .eq('role', role);
        
      if (error) {
        console.error("Error removing role:", error);
        toast.error("Failed to remove role");
        return;
      }
      
      toast.success(`Removed ${role} role successfully`);
      await fetchEmployees();
    } catch (error) {
      console.error("Error in removeRole:", error);
      toast.error("Failed to remove role");
    }
  };

  const availableRoles: AppRole[] = ['admin', 'sales', 'kitchen', 'baker', 'delivery', 'customer_service'];

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Employee */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add New Employee
          </CardTitle>
          <CardDescription>
            Create new employee accounts with email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="First Name"
                value={newEmployee.first_name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, first_name: e.target.value }))}
              />
              <Input
                placeholder="Last Name"
                value={newEmployee.last_name}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, last_name: e.target.value }))}
              />
            </div>
            <Input
              type="email"
              placeholder="Email Address"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <Button type="submit" className="w-full">
              Create Employee Account
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Current Employees ({employees.length})
          </CardTitle>
          <CardDescription>
            Manage employee roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No employees found. Create the first employee account above.
              </p>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {employee.display_name || `${employee.first_name} ${employee.last_name}`}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        ID: {employee.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1">
                      {employee.roles.map((role) => (
                        <Badge 
                          key={role} 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-red-100"
                          onClick={() => removeRole(employee.id, role)}
                        >
                          {role} ×
                        </Badge>
                      ))}
                    </div>
                    
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignRole(employee.id, e.target.value as AppRole);
                          e.target.value = "";
                        }
                      }}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">Add Role</option>
                      {availableRoles
                        .filter(role => !employee.roles.includes(role))
                        .map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))
                      }
                    </select>
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

export default EmployeeManagement;
