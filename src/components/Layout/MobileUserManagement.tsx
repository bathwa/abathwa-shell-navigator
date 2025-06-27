
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  CheckCircle,
  Building,
  Calendar,
  Download
} from 'lucide-react';

interface User {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  created_at: string;
  is_active?: boolean;
  profile_data_jsonb?: any;
}

interface MobileUserManagementProps {
  users: User[];
  filteredUsers: User[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  onEditUser: (user: User) => void;
  onAddUser: () => void;
  onDeleteUser: (user: User) => void;
  onExportUsers: () => void;
  isLoading: boolean;
}

export const MobileUserManagement = ({
  users,
  filteredUsers,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onEditUser,
  onAddUser,
  onDeleteUser,
  onExportUsers,
  isLoading
}: MobileUserManagementProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      super_admin: { variant: 'destructive' as const, label: 'Super Admin' },
      admin: { variant: 'default' as const, label: 'Admin' },
      entrepreneur: { variant: 'secondary' as const, label: 'Entrepreneur' },
      investor: { variant: 'outline' as const, label: 'Investor' },
      service_provider: { variant: 'default' as const, label: 'Service Provider' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.entrepreneur;
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  const getStatusBadge = (user: User) => {
    if (user.is_active === false) {
      return <Badge variant="destructive" className="text-xs">Inactive</Badge>;
    }
    return <Badge variant="default" className="text-xs">Active</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={onExportUsers}>
              <Download className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onAddUser}>
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters {showFilters ? '-' : '+'}
        </Button>

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 p-4 bg-slate-800 rounded-lg">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
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
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Total Users: {users.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Active: {users.filter(u => u.is_active !== false).length} | 
              Showing: {filteredUsers.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading users...</div>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium truncate">{user.full_name || 'No Name'}</h3>
                        <p className="text-sm text-muted-foreground truncate">{user.email || 'No Email'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user)}
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      {user.profile_data_jsonb?.company && (
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.profile_data_jsonb.company}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="p-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteUser(user)}
                      className="p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No users found.
        </div>
      )}
    </div>
  );
};
