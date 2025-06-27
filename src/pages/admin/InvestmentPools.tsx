import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Settings,
  Vote,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface InvestmentPool {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  current_leader_id?: string;
  election_nomination_start?: string;
  election_nomination_end?: string;
  election_voting_start?: string;
  election_voting_end?: string;
  max_members?: number;
  min_contribution?: number;
  joining_fee?: number;
}

interface PoolStats {
  totalPools: number;
  activePools: number;
  totalAmount: number;
  totalMembers: number;
}

export default function InvestmentPools() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [pools, setPools] = useState<InvestmentPool[]>([]);
  const [filteredPools, setFilteredPools] = useState<InvestmentPool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<InvestmentPool | null>(null);
  const [stats, setStats] = useState<PoolStats>({
    totalPools: 0,
    activePools: 0,
    totalAmount: 0,
    totalMembers: 0
  });

  const [newPool, setNewPool] = useState({
    name: '',
    description: '',
    target_amount: '',
    max_members: '',
    min_contribution: '',
    joining_fee: ''
  });

  const [editPool, setEditPool] = useState({
    name: '',
    description: '',
    target_amount: '',
    max_members: '',
    min_contribution: '',
    joining_fee: ''
  });

  useEffect(() => {
    loadPools();
  }, []);

  useEffect(() => {
    filterPools();
  }, [pools, searchTerm]);

  const loadPools = async () => {
    try {
      setIsLoading(true);

      const { data: poolsData, error } = await supabase
        .from('investment_pools')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPools(poolsData || []);
      calculateStats(poolsData || []);

    } catch (error) {
      console.error('Error loading pools:', error);
      toast({
        title: "Error",
        description: "Failed to load investment pools.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (poolsData: InvestmentPool[]) => {
    const stats: PoolStats = {
      totalPools: poolsData.length,
      activePools: poolsData.filter(p => p.status === 'open').length,
      totalAmount: poolsData.reduce((sum, p) => sum + p.current_amount, 0),
      totalMembers: 0 // Would need to query pool_members table
    };

    setStats(stats);
  };

  const filterPools = () => {
    let filtered = pools;

    if (searchTerm) {
      filtered = filtered.filter(pool => 
        pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPools(filtered);
  };

  const handleCreatePool = async () => {
    if (!user) return;

    try {
      // Validate required fields
      if (!newPool.name.trim()) {
        toast({
          title: "Error",
          description: "Pool name is required.",
          variant: "destructive",
        });
        return;
      }

      // Set election dates: January 10th of current year unless postponed
      const currentYear = new Date().getFullYear();
      const electionDate = new Date(currentYear, 0, 10); // January 10th
      
      const poolData = {
        name: newPool.name.trim(),
        description: newPool.description.trim() || null,
        target_amount: newPool.target_amount ? parseFloat(newPool.target_amount) : 0, // Default to 0 instead of null
        max_members: newPool.max_members ? parseInt(newPool.max_members) : null,
        min_contribution: newPool.min_contribution ? parseFloat(newPool.min_contribution) : null,
        joining_fee: newPool.joining_fee ? parseFloat(newPool.joining_fee) : null,
        current_amount: 0,
        status: 'open',
        created_by: user.id,
        election_nomination_start: new Date(electionDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days before
        election_nomination_end: new Date(electionDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days before
        election_voting_start: new Date(electionDate.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days before
        election_voting_end: electionDate.toISOString()
      };

      const { error } = await supabase
        .from('investment_pools')
        .insert(poolData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Investment pool created successfully.",
      });

      setIsCreateDialogOpen(false);
      setNewPool({
        name: '',
        description: '',
        target_amount: '',
        max_members: '',
        min_contribution: '',
        joining_fee: ''
      });
      loadPools();

    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Error",
        description: "Failed to create investment pool. Please check your input and try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePool = async () => {
    if (!selectedPool) return;

    try {
      const poolData = {
        name: editPool.name,
        description: editPool.description,
        target_amount: editPool.target_amount ? parseFloat(editPool.target_amount) : null,
        max_members: editPool.max_members ? parseInt(editPool.max_members) : null,
        min_contribution: editPool.min_contribution ? parseFloat(editPool.min_contribution) : null,
        joining_fee: editPool.joining_fee ? parseFloat(editPool.joining_fee) : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('investment_pools')
        .update(poolData)
        .eq('id', selectedPool.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Investment pool updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedPool(null);
      loadPools();

    } catch (error) {
      console.error('Error updating pool:', error);
      toast({
        title: "Error",
        description: "Failed to update investment pool.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (pool: InvestmentPool) => {
    setSelectedPool(pool);
    setEditPool({
      name: pool.name,
      description: pool.description,
      target_amount: pool.target_amount?.toString() || '',
      max_members: pool.max_members?.toString() || '',
      min_contribution: pool.min_contribution?.toString() || '',
      joining_fee: pool.joining_fee?.toString() || ''
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'open': { variant: 'default' as const, label: 'Open' },
      'closed': { variant: 'secondary' as const, label: 'Closed' },
      'suspended': { variant: 'destructive' as const, label: 'Suspended' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Investment Pools</h1>
          <p className="text-muted-foreground">Manage investment pools and member participation</p>
        </div>
        
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Pool
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pools</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Elections Due</CardTitle>
            <Vote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 10</div>
            <p className="text-xs text-muted-foreground">Next election cycle</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pools by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pools List */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Pools ({filteredPools.length})</CardTitle>
          <CardDescription>
            Manage investment pools and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Loading pools...</div>
            </div>
          ) : filteredPools.length > 0 ? (
            <div className="space-y-4">
              {filteredPools.map((pool) => (
                <div key={pool.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{pool.name}</h3>
                      {getStatusBadge(pool.status)}
                    </div>
                    <p className="text-muted-foreground mb-3">{pool.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Amount:</span>
                        <div className="font-medium">{formatCurrency(pool.current_amount)}</div>
                      </div>
                      {pool.target_amount && (
                        <div>
                          <span className="text-muted-foreground">Target Amount:</span>
                          <div className="font-medium">{formatCurrency(pool.target_amount)}</div>
                        </div>
                      )}
                      {pool.max_members && (
                        <div>
                          <span className="text-muted-foreground">Max Members:</span>
                          <div className="font-medium">{pool.max_members}</div>
                        </div>
                      )}
                      {pool.min_contribution && (
                        <div>
                          <span className="text-muted-foreground">Min Contribution:</span>
                          <div className="font-medium">{formatCurrency(pool.min_contribution)}</div>
                        </div>
                      )}
                      {pool.joining_fee && (
                        <div>
                          <span className="text-muted-foreground">Joining Fee:</span>
                          <div className="font-medium">{formatCurrency(pool.joining_fee)}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Next Election:</span>
                        <div className="font-medium">Jan 10, {new Date().getFullYear()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pool)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No investment pools found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search criteria' 
                  : 'Create your first investment pool to get started'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pool
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Pool Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Investment Pool</DialogTitle>
            <DialogDescription>
              Create a new investment pool with automatic election scheduling for January 10th each year.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Pool Name</Label>
              <Input
                value={newPool.name}
                onChange={(e) => setNewPool(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter pool name"
              />
            </div>
            <div className="col-span-2">
              <Label>Description</Label>
              <Textarea
                value={newPool.description}
                onChange={(e) => setNewPool(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the pool's purpose and strategy"
                rows={3}
              />
            </div>
            <div>
              <Label>Target Amount (Optional)</Label>
              <Input
                type="number"
                value={newPool.target_amount}
                onChange={(e) => setNewPool(prev => ({ ...prev, target_amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Maximum Members</Label>
              <Input
                type="number"
                value={newPool.max_members}
                onChange={(e) => setNewPool(prev => ({ ...prev, max_members: e.target.value }))}
                placeholder="Maximum number of members"
              />
            </div>
            <div>
              <Label>Minimum Contribution</Label>
              <Input
                type="number"
                value={newPool.min_contribution}
                onChange={(e) => setNewPool(prev => ({ ...prev, min_contribution: e.target.value }))}
                placeholder="Minimum investment amount"
              />
            </div>
            <div>
              <Label>Joining Fee</Label>
              <Input
                type="number"
                value={newPool.joining_fee}
                onChange={(e) => setNewPool(prev => ({ ...prev, joining_fee: e.target.value }))}
                placeholder="One-time joining fee"
              />
            </div>
            <div className="col-span-2 bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Election Schedule:</strong> Elections will be automatically scheduled for January 10th each year, 
                with nominations opening 30 days prior and voting starting 14 days before the election date.
              </p>
            </div>
          </div>
          <div className="flex space-x-2 pt-4">
            <Button onClick={handleCreatePool} className="flex-1">
              Create Pool
            </Button>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Pool Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Investment Pool</DialogTitle>
            <DialogDescription>
              Update pool settings and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedPool && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Pool Name</Label>
                <Input
                  value={editPool.name}
                  onChange={(e) => setEditPool(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter pool name"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={editPool.description}
                  onChange={(e) => setEditPool(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the pool's purpose and strategy"
                  rows={3}
                />
              </div>
              <div>
                <Label>Target Amount (Optional)</Label>
                <Input
                  type="number"
                  value={editPool.target_amount}
                  onChange={(e) => setEditPool(prev => ({ ...prev, target_amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Maximum Members</Label>
                <Input
                  type="number"
                  value={editPool.max_members}
                  onChange={(e) => setEditPool(prev => ({ ...prev, max_members: e.target.value }))}
                  placeholder="Maximum number of members"
                />
              </div>
              <div>
                <Label>Minimum Contribution</Label>
                <Input
                  type="number"
                  value={editPool.min_contribution}
                  onChange={(e) => setEditPool(prev => ({ ...prev, min_contribution: e.target.value }))}
                  placeholder="Minimum investment amount"
                />
              </div>
              <div>
                <Label>Joining Fee</Label>
                <Input
                  type="number"
                  value={editPool.joining_fee}
                  onChange={(e) => setEditPool(prev => ({ ...prev, joining_fee: e.target.value }))}
                  placeholder="One-time joining fee"
                />
              </div>
            </div>
          )}
          <div className="flex space-x-2 pt-4">
            <Button onClick={handleUpdatePool} className="flex-1">
              Update Pool
            </Button>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
