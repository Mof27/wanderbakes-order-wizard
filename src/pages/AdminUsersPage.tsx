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
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/services/supabase/database.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, X, UserPlus, KeyRound, Mail, AlertTriangle } from "lucide-react";
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  is_pin_only?: boolean;
}

const inviteUserSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  roles: z.array(z.string()).min(1, "Select at least one role")
});

type InviteFormValues = z.infer<typeof inviteUserSchema>;

// Schema for creating a new PIN-only user
const createPinUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  display_name: z.string().optional(),
  pin: z.string().length(6, "PIN must be 6 digits"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
});

type CreatePinUserValues = z.infer<typeof createPinUserSchema>;

const roleEditSchema = z.object({
  admin: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  baker: z.boolean().default(false),
  delivery: z.boolean().default(false),
  sales: z.boolean().default(false),
});

type RoleEditValues = z.infer<typeof roleEditSchema>;

const AdminUsersPage = () => {
  const { user, hasRole, roles } = useAuth();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [activeTab, setActiveTab] = useState<string>("email");
  
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
  
  const pinUserForm = useForm<CreatePinUserValues>({
    resolver: zodResolver(createPinUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      display_name: "",
      pin: "",
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
      
      // Check if we have a user ID to fetch users
      if (!user?.id) {
        toast.error('Authentication error: User ID not available');
        return;
      }
      
      console.log("Admin check:", {
        userId: user.id,
        roles,
        hasAdminRole: hasRole('admin'),
      });
      
      // Make sure the user has admin role before proceeding
      if (!hasRole('admin')) {
        toast.error('You must have admin privileges to view this page');
        setLoading(false);
        return;
      }
      
      // Call our new edge function instead of RPC
      const { data: response, error } = await supabase.functions.invoke('admin-users', {
        body: { userId: user.id }
      });
      
      if (error) {
        console.error('Error calling admin-users function:', error);
        toast.error('Failed to fetch users: ' + error.message);
        return;
      }
      
      console.log('Admin users response:', response);
      
      // Process the response data
      let allUsers: UserWithProfile[] = [];
      
      // If we have auth users, process them
      if (response.auth_users) {
        // Map auth users with profiles
        allUsers = response.auth_users.map((authUser: any) => {
          const profile = response.profiles?.find((p: any) => p.id === authUser.id) || null;
          const userRoles = response.roles?.filter((r: any) => r.user_id === authUser.id).map((r: any) => r.role) || [];
          
          // Check if this is a PIN-only user
          const isPinOnly = authUser.raw_user_meta_data?.is_pin_only === true || 
                          authUser.raw_app_meta_data?.provider === 'pin' ||
                          authUser.email?.endsWith('@pin-user.local');
          
          return {
            id: authUser.id,
            email: authUser.email || '',
            created_at: authUser.created_at,
            profile,
            roles: userRoles,
            is_pin_only: isPinOnly
          };
        });
      }
      
      // Process profiles that might not be in auth users (PIN-only users)
      if (response.profiles) {
        const existingIds = new Set(allUsers.map(u => u.id));
        
        // Find profiles that aren't in the auth users list but have pin_hash set
        const pinOnlyProfiles = response.profiles.filter((p: any) => 
          !existingIds.has(p.id) && p.pin_hash !== null
        );
        
        // Add these PIN-only users to our list
        for (const profile of pinOnlyProfiles) {
          const userRoles = response.roles?.filter((r: any) => r.user_id === profile.id).map((r: any) => r.role) || [];
          
          allUsers.push({
            id: profile.id,
            email: `PIN User (${profile.display_name || profile.first_name})`,
            created_at: profile.created_at,
            profile,
            roles: userRoles,
            is_pin_only: true
          });
        }
      }
      
      // Sort to put PIN users first
      allUsers.sort((a, b) => {
        if (a.is_pin_only && !b.is_pin_only) return -1;
        if (!a.is_pin_only && b.is_pin_only) return 1;
        return 0;
      });
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);
  
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

  const handleCreatePinUser = async (data: CreatePinUserValues) => {
    setIsSubmitting(true);
    try {
      // Convert roles to proper AppRole array
      const roles = data.roles as AppRole[];
      
      // Call our updated create_pin_user function
      const { data: userId, error } = await supabase.rpc('create_pin_user', {
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name || `${data.first_name} ${data.last_name}`,
        pin: data.pin,
        roles
      });
      
      if (error) {
        console.error("Error creating PIN user:", error);
        toast.error(`Failed to create user: ${error.message}`);
        return;
      }
      
      toast.success(`PIN user ${data.first_name} ${data.last_name} created successfully`);
      setInviteDialogOpen(false);
      pinUserForm.reset();
      
      // Refresh the user list
      await fetchUsers();
      
    } catch (error) {
      console.error("Error creating PIN user:", error);
      toast.error("An unexpected error occurred while creating the user");
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

  const handleResetPin = async () => {
    if (!selectedUser) return;

    try {
      if (newPin.length !== 6) {
        toast.error("PIN must be 6 digits");
        return;
      }

      // Call our updated hash_pin function and set the pin hash
      const { error } = await supabase.rpc("hash_pin", {
        pin: newPin
      }).then(result => {
        if (result.data) {
          return supabase
            .from("profiles")
            .update({ 
              pin_hash: result.data,
              failed_pin_attempts: 0,
              locked_until: null
            })
            .eq("id", selectedUser.id);
        } else {
          return { error: new Error("Failed to hash PIN") };
        }
      });

      if (error) {
        toast.error(`Failed to reset PIN: ${error.message}`);
        return;
      }

      // Use the profile's display_name property instead of accessing it directly
      toast.success(`PIN reset for ${selectedUser.profile?.display_name || selectedUser.email}`);
      setNewPin("");
    } catch (error) {
      console.error("Error resetting PIN:", error);
      toast.error("An unexpected error occurred");
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

  // Make the admin role check more prominent in the render logic
  if (!user) {
    return (
      <div className="container py-8">
        <Card className="p-8 flex flex-col items-center text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access this page.</p>
        </Card>
      </div>
    );
  }
  
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
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" /> Email/Password
                </TabsTrigger>
                <TabsTrigger value="pin" className="flex items-center">
                  <KeyRound className="mr-2 h-4 w-4" /> PIN Only
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="mt-4">
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
                                  id={`email-${role.id}`}
                                  onCheckedChange={(checked) => {
                                    const currentRoles = inviteForm.getValues('roles');
                                    const newRoles = checked
                                      ? [...currentRoles, role.id]
                                      : currentRoles.filter((r) => r !== role.id);
                                    inviteForm.setValue('roles', newRoles, { shouldValidate: true });
                                  }}
                                />
                                <label
                                  htmlFor={`email-${role.id}`}
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
              </TabsContent>

              <TabsContent value="pin" className="mt-4">
                <Form {...pinUserForm}>
                  <form onSubmit={pinUserForm.handleSubmit(handleCreatePinUser)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={pinUserForm.control}
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
                        control={pinUserForm.control}
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
                      control={pinUserForm.control}
                      name="display_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={pinUserForm.control}
                      name="pin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>6-Digit PIN</FormLabel>
                          <FormControl>
                            <InputOTP maxLength={6} {...field}>
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={pinUserForm.control}
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
                                  id={`pin-role-${role.id}`}
                                  onCheckedChange={(checked) => {
                                    const currentRoles = pinUserForm.getValues('roles');
                                    const newRoles = checked
                                      ? [...currentRoles, role.id]
                                      : currentRoles.filter((r) => r !== role.id);
                                    pinUserForm.setValue('roles', newRoles, { shouldValidate: true });
                                  }}
                                />
                                <label
                                  htmlFor={`pin-role-${role.id}`}
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
                        {isSubmitting ? "Creating..." : "Create PIN User"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
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
                    <TableHead>Type</TableHead>
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
                          {user.is_pin_only ? (
                            <Badge className="bg-green-500">PIN</Badge>
                          ) : (
                            <Badge variant="outline">Email</Badge>
                          )}
                        </TableCell>
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
                          <Dialog open={roleDialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                            if (!open) setSelectedUser(null);
                            setRoleDialogOpen(open);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="mr-1"
                                onClick={() => openRoleDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  Manage User
                                  {user.is_pin_only && <Badge className="bg-green-500">PIN User</Badge>}
                                </DialogTitle>
                                <DialogDescription>
                                  Update settings for {user.profile?.display_name || user.email}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6 py-4">
                                {user.is_pin_only && (
                                  <div className="space-y-3 border-b pb-4">
                                    <h3 className="text-lg font-medium">Reset PIN</h3>
                                    <div className="space-y-2">
                                      <FormLabel>New 6-digit PIN</FormLabel>
                                      <InputOTP maxLength={6} value={newPin} onChange={setNewPin} className="justify-start">
                                        <InputOTPGroup>
                                          <InputOTPSlot index={0} />
                                          <InputOTPSlot index={1} />
                                          <InputOTPSlot index={2} />
                                          <InputOTPSlot index={3} />
                                          <InputOTPSlot index={4} />
                                          <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                      </InputOTP>
                                      <Button 
                                        onClick={handleResetPin} 
                                        disabled={newPin.length !== 6}
                                        className="mt-2"
                                      >
                                        Set PIN
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <h3 className="text-lg font-medium">User Roles</h3>
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
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDeactivateUser(user.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
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
    </div>
  );
};

export default AdminUsersPage;
