import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Shield, 
  Mail, 
  Phone, 
  Building,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface User {
  id: string;
  full_name: string;
  email?: string;
  role: 'super_admin' | 'admin' | 'entrepreneur' | 'investor' | 'service_provider';
  created_at: string;
  avatar_url?: string;
  profile_data_jsonb?: any;
  is_active?: boolean;
  last_login?: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  roleDistribution: Record<string, number>;
}

export default function UserManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    roleDistribution: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    role: 'entrepreneur' as const,
    phone: '',
    company: '',
    location: '',
    bio: ''
  });

  const [addForm, setAddForm] = useState({
    full_name: '',
    email: '',
    role: 'entrepreneur' as const,
    phone: '',
    company: '',
    location: '',
    bio: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      // Ensure each user has an email property (fallback to empty string)
      const usersWithEmail = (usersData || []).map((u: any) => ({ ...u, email: u.email || '' }));
      setUsers(usersWithEmail);
      calculateStats(usersWithEmail);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersData: User[]) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const roleDistribution: Record<string, number> = {};
    usersData.forEach(user => {
      roleDistribution[user.role] = (roleDistribution[user.role] || 0) + 1;
    });

    setStats({
      totalUsers: usersData.length,
      activeUsers: usersData.filter(u => u.is_active !== false).length,
      newUsersThisMonth: usersData.filter(u => new Date(u.created_at) >= thisMonth).length,
      roleDistribution
    });
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.is_active !== false : user.is_active === false
      );
    }

    setFilteredUsers(filtered);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      role: user.role,
      phone: user.profile_data_jsonb?.phone || '',
      company: user.profile_data_jsonb?.company || '',
      location: user.profile_data_jsonb?.location || '',
      bio: user.profile_data_jsonb?.bio || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      const updateObj: any = {
        full_name: editForm.full_name,
        role: editForm.role,
        profile_data_jsonb: {
          phone: editForm.phone,
          company: editForm.company,
          location: editForm.location,
          bio: editForm.bio
        }
      };
      await supabase
        .from('profiles')
        .update(updateObj)
        .eq('id', selectedUser.id);
      toast({
        title: "Success",
        description: "User updated successfully.",
      });
      setIsEditDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user.",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: addForm.email,
        password: 'temporary123',
        email_confirm: true,
        user_metadata: {
          full_name: addForm.full_name,
          role: addForm.role
        }
      });
      if (authError) throw authError;
      if (authData.user) {
        const updateObj: any = {
          full_name: addForm.full_name,
          role: addForm.role,
          profile_data_jsonb: {
            phone: addForm.phone,
            company: addForm.company,
            location: addForm.location,
            bio: addForm.bio
          }
        };
        await supabase
          .from('profiles')
          .update(updateObj)
          .eq('id', authData.user.id);
      }
      toast({
        title: "Success",
        description: "User created successfully. They will receive an email to set their password.",
      });
      setIsAddDialogOpen(false);
      setAddForm({
        full_name: '',
        email: '',
        role: 'entrepreneur',
        phone: '',
        company: '',
        location: '',
        bio: ''
      });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Delete from auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id);
      if (authError) throw authError;

      toast({
        title: "Success",
        description: "User deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateUser = async (userId: string, deactivate: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !deactivate })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${deactivate ? 'deactivated' : 'activated'} successfully.`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Company', 'Location', 'Created At', 'Status'],
      ...filteredUsers.map(user => [
        user.full_name || '',
        user.email || '',
        user.role,
        user.profile_data_jsonb?.company || '',
        user.profile_data_jsonb?.location || '',
        new Date(user.created_at).toLocaleDateString(),
        user.is_active !== false ? 'Active' : 'Inactive'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { variant: 'destructive' as const, label: 'Super Admin' },
      admin: { variant: 'default' as const, label: 'Admin' },
      entrepreneur: { variant: 'secondary' as const, label: 'Entrepreneur' },
      investor: { variant: 'outline' as const, label: 'Investor' },
      service_provider: { variant: 'default' as const, label: 'Service Provider' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.entrepreneur;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusBadge = (user: User) => {
    if (user.is_active === false) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const auditAndFixRoles = async () => {
    try {
      setIsLoading(true);
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('*');
      if (error) throw error;
      let fixedCount = 0;
      for (const user of usersData as User[]) {
        let correctRole = user.role;
        if (!['entrepreneur', 'investor', 'admin', 'super_admin', 'service_provider'].includes(user.role)) {
          correctRole = 'entrepreneur';
        }
        if (user.role !== correctRole) {
          await supabase.from('profiles').update({ role: correctRole }).eq('id', user.id);
          fixedCount++;
        }
      }
      toast({
        title: 'Audit Complete',
        description: `${fixedCount} user roles fixed.`,
      });
      loadUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to audit/fix user roles.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage platform users and their roles</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified role and details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={addForm.full_name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={addForm.role} onValueChange={(value: any) => setAddForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                      <SelectItem value="investor">Investor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {currentUser?.role === 'super_admin' && (
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={addForm.phone}
                    onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={addForm.company}
                    onChange={(e) => setAddForm(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={addForm.location}
                    onChange={(e) => setAddForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Input
                    value={addForm.bio}
                    onChange={(e) => setAddForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Enter bio"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddUser} className="flex-1">
                    Create User
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrepreneurs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleDistribution.entrepreneur || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round(((stats.roleDistribution.entrepreneur || 0) / stats.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.roleDistribution.investor || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalUsers > 0 ? Math.round(((stats.roleDistribution.investor || 0) / stats.totalUsers) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading users...</div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{user.full_name || 'No Name'}</h3>
                        {getRoleBadge(user.role)}
                        {getStatusBadge(user)}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email || 'No Email'}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                        {user.profile_data_jsonb?.company && (
                          <span className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{user.profile_data_jsonb.company}</span>
                          </span>
                        )}
                        {user.profile_data_jsonb?.location && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{user.profile_data_jsonb.location}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivateUser(user.id, user.is_active !== false)}
                    >
                      {user.is_active !== false ? (
                        <UserX className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    {currentUser?.id !== user.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editForm.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={editForm.role} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {currentUser?.role === 'super_admin' && (
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Company</label>
              <Input
                value={editForm.company}
                onChange={(e) => setEditForm(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Location</label>
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter location"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Input
                value={editForm.bio}
                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Enter bio"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleUpdateUser} className="flex-1">
                Update User
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.full_name || selectedUser?.email}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={handleDeleteUser} className="flex-1">
              Delete User
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="outline" onClick={auditAndFixRoles}>
        <Shield className="h-4 w-4 mr-2" />
        Audit & Fix User Roles
      </Button>
    </div>
  );
} 