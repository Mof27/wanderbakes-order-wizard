
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { AppRole } from "@/services/supabase/database.types";
import { supabase } from "@/services/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, UserPlus } from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  roles: AppRole[];
  is_pin_only?: boolean;
}

// Schema for creating a new PIN-only user
const createUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  display_name: z.string().optional(),
  pin: z.string().length(6, "PIN must be 6 digits"),
  roles: z.array(z.string()).min(1, "Select at least one role"),
});

type CreateUserValues = z.infer<typeof createUserSchema>;

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPin, setNewPin] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole | "">("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  // Form for creating new PIN-only users
  const createForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      display_name: "",
      pin: "",
      roles: [],
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get users with their profiles and roles
      const { data: usersData, error } = await supabase.rpc("admin_get_users");
      
      if (error) {
        toast.error(`Failed to fetch users: ${error.message}`);
        return;
      }

      const enrichedUsers: User[] = [];

      for (const user of usersData) {
        // Get profile info
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, display_name")
          .eq("id", user.id)
          .single();

        // Get roles
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        // Check if this is a PIN-only user (by looking at the metadata)
        const isPinOnly = user.raw_user_meta_data?.is_pin_only === true || 
                          user.raw_app_meta_data?.provider === 'pin' ||
                          user.email.endsWith('@pin-user.local');

        enrichedUsers.push({
          id: user.id,
          email: user.email,
          first_name: profile?.first_name || user.raw_user_meta_data?.first_name || null,
          last_name: profile?.last_name || user.raw_user_meta_data?.last_name || null,
          display_name: profile?.display_name || user.raw_user_meta_data?.display_name || null,
          roles: rolesData?.map((r) => r.role) || [],
          is_pin_only: isPinOnly
        });
      }

      setUsers(enrichedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("An unexpected error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePinUser = async (data: CreateUserValues) => {
    try {
      // Convert roles to proper AppRole array
      const roles = data.roles as AppRole[];
      
      // Call the create_pin_user function
      const { data: newUserId, error } = await supabase.rpc('create_pin_user', {
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: data.display_name || `${data.first_name} ${data.last_name}`,
        pin: data.pin,
        roles
      });
      
      if (error) {
        console.error("Error creating user:", error);
        toast.error(`Failed to create user: ${error.message}`);
        return;
      }
      
      toast.success(`User ${data.first_name} ${data.last_name} created successfully`);
      setCreateDialogOpen(false);
      createForm.reset();
      
      // Refresh the user list
      await fetchUsers();
      
    } catch (error) {
      console.error("Error creating PIN user:", error);
      toast.error("An unexpected error occurred while creating the user");
    }
  };

  const handleResetPin = async () => {
    if (!editingUser) return;

    try {
      if (newPin.length !== 6) {
        toast.error("PIN must be 6 digits");
        return;
      }

      // Hash and store new PIN
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
            .eq("id", editingUser.id);
        } else {
          return { error: new Error("Failed to hash PIN") };
        }
      });

      if (error) {
        toast.error(`Failed to reset PIN: ${error.message}`);
        return;
      }

      toast.success(`PIN reset for ${editingUser.display_name || editingUser.email}`);
      setEditingUser(null);
      setNewPin("");
    } catch (error) {
      console.error("Error resetting PIN:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleAddRole = async () => {
    if (!editingUser || !selectedRole) return;

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: editingUser.id,
          role: selectedRole,
        });

      if (error) {
        if (error.code === "23505") {
          // Unique violation - role already exists
          toast.error("User already has this role");
        } else {
          toast.error(`Failed to add role: ${error.message}`);
        }
        return;
      }

      toast.success(`Role ${selectedRole} added to ${editingUser.display_name || editingUser.email}`);
      setSelectedRole("");
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === editingUser.id) {
          return {
            ...user,
            roles: [...user.roles, selectedRole as AppRole]
          };
        }
        return user;
      }));
      
      setEditingUser({
        ...editingUser,
        roles: [...editingUser.roles, selectedRole as AppRole]
      });
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) {
        toast.error(`Failed to remove role: ${error.message}`);
        return;
      }

      toast.success(`Role ${role} removed`);
      
      // Update local state
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            roles: user.roles.filter(r => r !== role)
          };
        }
        return user;
      }));
      
      if (editingUser && editingUser.id === userId) {
        setEditingUser({
          ...editingUser,
          roles: editingUser.roles.filter(r => r !== role)
        });
      }
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("An unexpected error occurred");
    }
  };

  if (!isAdmin()) {
    navigate("/unauthorized");
    return null;
  }

  return (
    <div className="p-6">
      <Helmet>
        <title>User Management | WanderBakes</title>
      </Helmet>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Create PIN User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Create a new PIN-based user that can log in using only a PIN.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreatePinUser)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
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
                    control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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
                              id={`role-${role.id}`}
                              onCheckedChange={(checked) => {
                                const currentRoles = createForm.getValues('roles');
                                const newRoles = checked
                                  ? [...currentRoles, role.id]
                                  : currentRoles.filter((r) => r !== role.id);
                                createForm.setValue('roles', newRoles, { shouldValidate: true });
                              }}
                            />
                            <label
                              htmlFor={`role-${role.id}`}
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
                  <Button type="submit">
                    Create User
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
          <CardDescription>Manage system users</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Login Type</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const name = user.display_name || `${user.first_name || ''} ${user.last_name || ''}`;
                  const initial = name ? name[0]?.toUpperCase() : 'U';
                  
                  return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.is_pin_only ? (
                        <Badge className="bg-green-500">PIN Only</Badge>
                      ) : (
                        <Badge variant="outline">Email/Password</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge 
                            key={role} 
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {role}
                            <button 
                              className="ml-1 text-xs hover:text-destructive"
                              onClick={() => handleRemoveRole(user.id, role)}
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          {editingUser && (
                            <>
                              <DialogHeader>
                                <DialogTitle>Manage User</DialogTitle>
                                <DialogDescription>
                                  Update settings for {editingUser.display_name || editingUser.email}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6 py-4">
                                <div className="space-y-2">
                                  <h3 className="text-lg font-medium">Reset PIN</h3>
                                  <div className="space-y-2">
                                    <Label htmlFor="pin">New 6-digit PIN</Label>
                                    <InputOTP maxLength={6} value={newPin} onChange={setNewPin}>
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
                                
                                <div className="space-y-2">
                                  <h3 className="text-lg font-medium">Add Role</h3>
                                  <div className="flex items-center gap-2">
                                    <Select 
                                      value={selectedRole} 
                                      onValueChange={(value) => setSelectedRole(value as AppRole)}
                                    >
                                      <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="sales">Sales</SelectItem>
                                        <SelectItem value="kitchen">Kitchen</SelectItem>
                                        <SelectItem value="baker">Baker</SelectItem>
                                        <SelectItem value="delivery">Delivery</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <Button onClick={handleAddRole} disabled={!selectedRole}>
                                      Add Role
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                  setEditingUser(null);
                                  setNewPin("");
                                  setSelectedRole("");
                                }}>
                                  Close
                                </Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )})}
                
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
