
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/services/supabase/client";
import { AppRole } from "@/services/supabase/database.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, X, UserPlus, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  profile: {
    first_name: string | null;
    last_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  roles: AppRole[];
}

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  roles: z.array(z.string()).min(1, "Select at least one role")
});

type InviteFormValues = z.infer<typeof inviteUserSchema>;

const roleEditSchema = z.object({
  admin: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  baker: z.boolean().default(false),
  delivery: z.boolean().default(false),
  sales: z.boolean().default(false),
});

type RoleEditValues = z.infer<typeof roleEditSchema>;

const AdminUsersPage = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      roles: []
    }
  });
  
  const roleForm = useForm<RoleEditValues>({
    resolver: zodResolver(roleEditSchema),
    defaultValues: {
      admin: false,
      kitchen: false,
      baker: false,
      delivery: false,
      sales: false
    }
  });
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users from the auth.users table (requires admin privileges)
      const { data: authUsers, error: authError } = await supabase.rpc('admin_get_users');
      
      if (authError) {
        console.error('Error fetching users:', authError);
        toast.error('Failed to fetch users: ' + authError.message);
        return;
      }
      
      // Map user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }
      
      // Map user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
        
      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }
      
      // Combine data
      const usersWithProfiles: UserWithProfile[] = authUsers.map((user: any) => {
        const profile = profiles?.find(p => p.id === user.id) || null;
        const userRoles = rolesData?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        
        return {
          ...user,
          profile,
          roles: userRoles
        };
      });
      
      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (hasRole('admin')) {
      fetchUsers();
    }
  }, [hasRole]);
  
  const handleInviteUser = async (data: InviteFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create the user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.first_name,
          last_name: data.last_name,
          display_name: `${data.first_name} ${data.last_name}`
        }
      });
      
      if (userError) {
        toast.error('Failed to create user: ' + userError.message);
        return;
      }
      
      // Assign roles
      for (const role of data.roles) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userData.user.id,
            role: role as AppRole
          });
          
        if (roleError) {
          console.error(`Error assigning ${role} role:`, roleError);
          toast.error(`Failed to assign ${role} role`);
        }
      }
      
      toast.success('User created successfully');
      setInviteDialogOpen(false);
      inviteForm.reset();
      fetchUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('An error occurred while creating the user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditRoles = async (values: RoleEditValues) => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      // Get the selected roles
      const selectedRoles: AppRole[] = [];
      if (values.admin) selectedRoles.push('admin');
      if (values.kitchen) selectedRoles.push('kitchen');
      if (values.baker) selectedRoles.push('baker');
      if (values.delivery) selectedRoles.push('delivery');
      if (values.sales) selectedRoles.push('sales');
      
      // Delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', selectedUser.id);
        
      if (deleteError) {
        toast.error('Failed to update roles: ' + deleteError.message);
        return;
      }
      
      // Add new roles
      for (const role of selectedRoles) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedUser.id,
            role
          });
          
        if (insertError) {
          console.error(`Error assigning ${role} role:`, insertError);
          toast.error(`Failed to assign ${role} role`);
        }
      }
      
      toast.success('User roles updated successfully');
      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating roles:', error);
      toast.error('An error occurred while updating roles');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeactivateUser = async (userId: string) => {
    // Here we would normally implement deactivation, but for safety we'll just show a message
    toast.info("User deactivation requires Supabase Admin access. You'll need to handle this in the Supabase dashboard for now.");
  };
  
  const openRoleDialog = (user: UserWithProfile) => {
    setSelectedUser(user);
    
    // Set the initial values based on the user's current roles
    roleForm.setValue('admin', user.roles.includes('admin'));
    roleForm.setValue('kitchen', user.roles.includes('kitchen'));
    roleForm.setValue('baker', user.roles.includes('baker'));
    roleForm.setValue('delivery', user.roles.includes('delivery'));
    roleForm.setValue('sales', user.roles.includes('sales'));
    
    setRoleDialogOpen(true);
  };

  // Ensure user has admin role
  if (!hasRole('admin')) {
    return (
      <div className="container py-8">
        <Card className="p-8 flex flex-col items-center text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Helmet>
        <title>User Management | WanderBakes</title>
      </Helmet>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specified roles
              </DialogDescription>
            </DialogHeader>
            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(handleInviteUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={inviteForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inviteForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inviteForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={inviteForm.control}
                  name="roles"
                  render={() => (
                    <FormItem>
                      <FormLabel>Roles</FormLabel>
                      <div className="space-y-2">
                        {[
                          { id: 'admin', label: 'Administrator' },
                          { id: 'kitchen', label: 'Kitchen Staff' },
                          { id: 'baker', label: 'Baker' },
                          { id: 'delivery', label: 'Delivery' },
                          { id: 'sales', label: 'Sales' },
                        ].map((role) => (
                          <div key={role.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={role.id}
                              onCheckedChange={(checked) => {
                                const currentRoles = inviteForm.getValues('roles');
                                const newRoles = checked
                                  ? [...currentRoles, role.id]
                                  : currentRoles.filter((r) => r !== role.id);
                                inviteForm.setValue('roles', newRoles, { shouldValidate: true });
                              }}
                            />
                            <label
                              htmlFor={role.id}
                              className="text-sm"
                            >
                              {role.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and role assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const name = user.profile
                      ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim()
                      : user.email?.split('@')[0] || 'Unknown';
                    const initial = name ? name[0].toUpperCase() : 'U';
                    const formattedDate = new Date(user.created_at).toLocaleDateString();
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              {user.profile?.avatar_url && (
                                <AvatarImage src={user.profile.avatar_url} alt={name} />
                              )}
                              <AvatarFallback>{initial}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} variant="secondary" className="capitalize">
                                  {role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">No roles</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formattedDate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => openRoleDialog(user)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => confirmDeactivateUser(user.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Role editing dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Roles</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>Manage roles for {selectedUser.email}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(handleEditRoles)} className="space-y-4">
              <div className="space-y-4">
                {[
                  { id: 'admin', label: 'Administrator', description: 'Full system access' },
                  { id: 'kitchen', label: 'Kitchen Staff', description: 'Manage kitchen operations' },
                  { id: 'baker', label: 'Baker', description: 'Access to production and recipes' },
                  { id: 'delivery', label: 'Delivery', description: 'Manage deliveries and routes' },
                  { id: 'sales', label: 'Sales', description: 'Manage orders and customers' },
                ].map((role) => (
                  <FormField
                    key={role.id}
                    control={roleForm.control}
                    name={role.id as keyof RoleEditValues}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">{role.label}</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersPage;
