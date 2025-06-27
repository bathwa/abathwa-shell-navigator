import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Plus, 
  Users, 
  Target, 
  Calendar, 
  DollarSign, 
  Vote, 
  Award,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface InvestmentPool {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  status: string;
  created_by: string;
  current_leader_id?: string;
  election_nomination_start?: string;
  election_nomination_end?: string;
  election_voting_start?: string;
  election_voting_end?: string;
  created_at: string;
  updated_at: string;
  creator?: {
    full_name: string;
    email: string;
  };
  current_leader?: {
    full_name: string;
    email: string;
  };
}

interface PoolMember {
  id: string;
  pool_id: string;
  member_id: string;
  joined_at: string;
  is_active: boolean;
  investment_contribution: number;
  member?: {
    full_name: string;
    email: string;
    role: string;
  };
}

interface PoolNomination {
  id: string;
  pool_id: string;
  nominee_id: string;
  nominator_id: string;
  nomination_date: string;
  motivation: string;
  status: string;
  nominee?: {
    full_name: string;
    email: string;
  };
  nominator?: {
    full_name: string;
    email: string;
  };
}

interface PoolVote {
  id: string;
  pool_id: string;
  voter_id: string;
  candidate_id: string;
  vote_date: string;
  voter?: {
    full_name: string;
    email: string;
  };
  candidate?: {
    full_name: string;
    email: string;
  };
}

export default function InvestmentPools() {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  
  const [pools, setPools] = useState<InvestmentPool[]>([]);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [nominations, setNominations] = useState<PoolNomination[]>([]);
  const [votes, setVotes] = useState<PoolVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('pools');
  const [selectedPool, setSelectedPool] = useState<InvestmentPool | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isElectionDialogOpen, setIsElectionDialogOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    target_amount: 0,
    auto_campaign: true,
    auto_nominations: true,
    auto_elections: true,
    nomination_period_days: 7,
    voting_period_days: 3,
    election_cycle_months: 12
  });

  const [electionForm, setElectionForm] = useState({
    nomination_start: '',
    nomination_end: '',
    voting_start: '',
    voting_end: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load pools
      const { data: poolsData, error: poolsError } = await supabase
        .from('investment_pools')
        .select(`
          *,
          creator:profiles!investment_pools_created_by_fkey(full_name, email),
          current_leader:profiles!investment_pools_current_leader_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (poolsError) throw poolsError;
      setPools(poolsData || []);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('pool_members')
        .select(`
          *,
          member:profiles!pool_members_member_id_fkey(full_name, email, role)
        `);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Load nominations
      const { data: nominationsData, error: nominationsError } = await supabase
        .from('pool_nominations')
        .select(`
          *,
          nominee:profiles!pool_nominations_nominee_id_fkey(full_name, email),
          nominator:profiles!pool_nominations_nominator_id_fkey(full_name, email)
        `);

      if (nominationsError) throw nominationsError;
      setNominations(nominationsData || []);

      // Load votes
      const { data: votesData, error: votesError } = await supabase
        .from('pool_votes')
        .select(`
          *,
          voter:profiles!pool_votes_voter_id_fkey(full_name, email),
          candidate:profiles!pool_votes_candidate_id_fkey(full_name, email)
        `);

      if (votesError) throw votesError;
      setVotes(votesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load investment pools data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePool = async () => {
    try {
      const poolData = {
        name: createForm.name,
        description: createForm.description,
        target_amount: createForm.target_amount,
        current_amount: 0,
        status: 'open',
        created_by: currentUser?.id,
        auto_campaign: createForm.auto_campaign,
        auto_nominations: createForm.auto_nominations,
        auto_elections: createForm.auto_elections
      };

      const { data: pool, error } = await supabase
        .from('investment_pools')
        .insert(poolData)
        .select()
        .single();

      if (error) throw error;

      // Set up automated election cycle if enabled
      if (createForm.auto_elections) {
        const now = new Date();
        const nominationStart = new Date(now.getTime() + (createForm.nomination_period_days * 24 * 60 * 60 * 1000));
        const nominationEnd = new Date(nominationStart.getTime() + (createForm.nomination_period_days * 24 * 60 * 60 * 1000));
        const votingStart = new Date(nominationEnd.getTime() + (24 * 60 * 60 * 1000));
        const votingEnd = new Date(votingStart.getTime() + (createForm.voting_period_days * 24 * 60 * 60 * 1000));

        await supabase
          .from('investment_pools')
          .update({
            election_nomination_start: nominationStart.toISOString(),
            election_nomination_end: nominationEnd.toISOString(),
            election_voting_start: votingStart.toISOString(),
            election_voting_end: votingEnd.toISOString()
          })
          .eq('id', pool.id);
      }

      toast({
        title: "Success",
        description: "Investment pool created successfully with automated features.",
      });

      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        description: '',
        target_amount: 0,
        auto_campaign: true,
        auto_nominations: true,
        auto_elections: true,
        nomination_period_days: 7,
        voting_period_days: 3,
        election_cycle_months: 12
      });
      loadData();
    } catch (error) {
      console.error('Error creating pool:', error);
      toast({
        title: "Error",
        description: "Failed to create investment pool.",
        variant: "destructive",
      });
    }
  };

  const handleSetupElection = async () => {
    if (!selectedPool) return;

    try {
      const { error } = await supabase
        .from('investment_pools')
        .update({
          election_nomination_start: electionForm.nomination_start,
          election_nomination_end: electionForm.nomination_end,
          election_voting_start: electionForm.voting_start,
          election_voting_end: electionForm.voting_end
        })
        .eq('id', selectedPool.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Election cycle configured successfully.",
      });

      setIsElectionDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error setting up election:', error);
      toast({
        title: "Error",
        description: "Failed to configure election cycle.",
        variant: "destructive",
      });
    }
  };

  const handleVoteOfNoConfidence = async (poolId: string, leaderId: string) => {
    try {
      // Get all pool members
      const poolMembers = members.filter(m => m.pool_id === poolId && m.is_active);
      const totalMembers = poolMembers.length;
      const requiredVotes = Math.ceil(totalMembers * 0.6); // 60% majority

      // Count votes against current leader
      const votesAgainst = votes.filter(v => 
        v.pool_id === poolId && 
        v.candidate_id === leaderId && 
        new Date(v.vote_date) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      ).length;

      if (votesAgainst >= requiredVotes) {
        // Remove current leader
        await supabase
          .from('investment_pools')
          .update({ current_leader_id: null })
          .eq('id', poolId);

        // Trigger new election
        const now = new Date();
        const nominationStart = new Date(now.getTime() + (24 * 60 * 60 * 1000));
        const nominationEnd = new Date(nominationStart.getTime() + (7 * 24 * 60 * 60 * 1000));
        const votingStart = new Date(nominationEnd.getTime() + (24 * 60 * 60 * 1000));
        const votingEnd = new Date(votingStart.getTime() + (3 * 24 * 60 * 60 * 1000));

        await supabase
          .from('investment_pools')
          .update({
            election_nomination_start: nominationStart.toISOString(),
            election_nomination_end: nominationEnd.toISOString(),
            election_voting_start: votingStart.toISOString(),
            election_voting_end: votingEnd.toISOString()
          })
          .eq('id', poolId);

        toast({
          title: "Vote of No Confidence Successful",
          description: "Leader removed and new election triggered.",
        });
      } else {
        toast({
          title: "Insufficient Votes",
          description: `Need ${requiredVotes - votesAgainst} more votes for removal.`,
          variant: "destructive",
        });
      }

      loadData();
    } catch (error) {
      console.error('Error processing vote of no confidence:', error);
      toast({
        title: "Error",
        description: "Failed to process vote of no confidence.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default' as const, label: 'Open' },
      closed: { variant: 'secondary' as const, label: 'Closed' },
      funded: { variant: 'default' as const, label: 'Funded' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getElectionStatus = (pool: InvestmentPool) => {
    const now = new Date();
    const nominationStart = pool.election_nomination_start ? new Date(pool.election_nomination_start) : null;
    const nominationEnd = pool.election_nomination_end ? new Date(pool.election_nomination_end) : null;
    const votingStart = pool.election_voting_start ? new Date(pool.election_voting_start) : null;
    const votingEnd = pool.election_voting_end ? new Date(pool.election_voting_end) : null;

    if (!nominationStart || !nominationEnd || !votingStart || !votingEnd) {
      return { status: 'Not Scheduled', color: 'secondary' as const };
    }

    if (now < nominationStart) {
      return { status: 'Upcoming', color: 'secondary' as const };
    } else if (now >= nominationStart && now <= nominationEnd) {
      return { status: 'Nominations Open', color: 'default' as const };
    } else if (now > nominationEnd && now < votingStart) {
      return { status: 'Nominations Closed', color: 'secondary' as const };
    } else if (now >= votingStart && now <= votingEnd) {
      return { status: 'Voting Open', color: 'default' as const };
    } else if (now > votingEnd) {
      return { status: 'Completed', color: 'secondary' as const };
    }

    return { status: 'Unknown', color: 'secondary' as const };
  };

  const getPoolMembers = (poolId: string) => {
    return members.filter(m => m.pool_id === poolId && m.is_active);
  };

  const getPoolNominations = (poolId: string) => {
    return nominations.filter(n => n.pool_id === poolId);
  };

  const getPoolVotes = (poolId: string) => {
    return votes.filter(v => v.pool_id === poolId);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Investment Pools Management</h1>
          <p className="text-muted-foreground">Manage investment pools with automated campaigns and elections</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Pool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Investment Pool</DialogTitle>
              <DialogDescription>
                Create a new investment pool with automated features
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Pool Name</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter pool name"
                  />
                </div>
                <div>
                  <Label>Target Amount (USD)</Label>
                  <Input
                    type="number"
                    value={createForm.target_amount}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter pool description"
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Automated Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_campaign"
                      checked={createForm.auto_campaign}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, auto_campaign: e.target.checked }))}
                    />
                    <Label htmlFor="auto_campaign">Auto Campaign</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_nominations"
                      checked={createForm.auto_nominations}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, auto_nominations: e.target.checked }))}
                    />
                    <Label htmlFor="auto_nominations">Auto Nominations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_elections"
                      checked={createForm.auto_elections}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, auto_elections: e.target.checked }))}
                    />
                    <Label htmlFor="auto_elections">Auto Elections</Label>
                  </div>
                </div>
                
                {createForm.auto_elections && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Nomination Period (days)</Label>
                      <Input
                        type="number"
                        value={createForm.nomination_period_days}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, nomination_period_days: parseInt(e.target.value) || 7 }))}
                      />
                    </div>
                    <div>
                      <Label>Voting Period (days)</Label>
                      <Input
                        type="number"
                        value={createForm.voting_period_days}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, voting_period_days: parseInt(e.target.value) || 3 }))}
                      />
                    </div>
                    <div>
                      <Label>Election Cycle (months)</Label>
                      <Input
                        type="number"
                        value={createForm.election_cycle_months}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, election_cycle_months: parseInt(e.target.value) || 12 }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCreatePool} className="flex-1">
                  Create Pool
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pools Tab */}
        <TabsContent value="pools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Investment Pools</CardTitle>
              <CardDescription>
                Manage investment pools and their configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading pools...</div>
                </div>
              ) : pools.length > 0 ? (
                <div className="space-y-4">
                  {pools.map((pool) => {
                    const poolMembers = getPoolMembers(pool.id);
                    const electionStatus = getElectionStatus(pool);
                    
                    return (
                      <div key={pool.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{pool.name}</h3>
                              {getStatusBadge(pool.status)}
                              <Badge variant={electionStatus.color}>{electionStatus.status}</Badge>
                            </div>
                            <p className="text-muted-foreground">{pool.description}</p>
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4" />
                                <span>${pool.current_amount?.toLocaleString()} / ${pool.target_amount?.toLocaleString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{poolMembers.length} members</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created {new Date(pool.created_at).toLocaleDateString()}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPool(pool);
                                setIsElectionDialogOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/pool/${pool.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                              Pool Dashboard
                            </Button>
                          </div>
                        </div>

                        {pool.current_leader && (
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium">Current Leader:</span>
                              <span>{pool.current_leader.full_name}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVoteOfNoConfidence(pool.id, pool.current_leader_id!)}
                            >
                              <Vote className="h-4 w-4 mr-2" />
                              Vote of No Confidence
                            </Button>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Funding Progress</span>
                              <span>{Math.round((pool.current_amount / pool.target_amount) * 100)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${Math.min((pool.current_amount / pool.target_amount) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No investment pools yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first investment pool to get started
                  </p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    Create Pool
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Members</CardTitle>
              <CardDescription>
                View and manage pool memberships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pools.map((pool) => {
                  const poolMembers = getPoolMembers(pool.id);
                  
                  return (
                    <div key={pool.id} className="border rounded-lg p-4">
                      <h3 className="font-medium mb-3">{pool.name} - Members ({poolMembers.length})</h3>
                      <div className="space-y-2">
                        {poolMembers.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {member.member?.full_name?.charAt(0) || member.member?.email.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{member.member?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{member.member?.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${member.investment_contribution?.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Elections Tab */}
        <TabsContent value="elections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Election Management</CardTitle>
              <CardDescription>
                Monitor and manage pool elections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pools.map((pool) => {
                  const poolNominations = getPoolNominations(pool.id);
                  const poolVotes = getPoolVotes(pool.id);
                  const electionStatus = getElectionStatus(pool);
                  
                  return (
                    <div key={pool.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{pool.name}</h3>
                        <Badge variant={electionStatus.color}>{electionStatus.status}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Nominations ({poolNominations.length})</h4>
                          <div className="space-y-2">
                            {poolNominations.map((nomination) => (
                              <div key={nomination.id} className="p-2 bg-muted rounded">
                                <p className="font-medium">{nomination.nominee?.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Nominated by {nomination.nominator?.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {nomination.motivation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Votes ({poolVotes.length})</h4>
                          <div className="space-y-2">
                            {poolVotes.map((vote) => (
                              <div key={vote.id} className="p-2 bg-muted rounded">
                                <p className="font-medium">{vote.voter?.full_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Voted for {vote.candidate?.full_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(vote.vote_date).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Total Pools</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pools.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active investment pools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Total Members</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{members.filter(m => m.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all pools
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Total Funding</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${pools.reduce((sum, pool) => sum + pool.current_amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Raised across all pools
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Election Setup Dialog */}
      <Dialog open={isElectionDialogOpen} onOpenChange={setIsElectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Election Cycle</DialogTitle>
            <DialogDescription>
              Set up election dates for {selectedPool?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nomination Start</Label>
              <Input
                type="datetime-local"
                value={electionForm.nomination_start}
                onChange={(e) => setElectionForm(prev => ({ ...prev, nomination_start: e.target.value }))}
              />
            </div>
            <div>
              <Label>Nomination End</Label>
              <Input
                type="datetime-local"
                value={electionForm.nomination_end}
                onChange={(e) => setElectionForm(prev => ({ ...prev, nomination_end: e.target.value }))}
              />
            </div>
            <div>
              <Label>Voting Start</Label>
              <Input
                type="datetime-local"
                value={electionForm.voting_start}
                onChange={(e) => setElectionForm(prev => ({ ...prev, voting_start: e.target.value }))}
              />
            </div>
            <div>
              <Label>Voting End</Label>
              <Input
                type="datetime-local"
                value={electionForm.voting_end}
                onChange={(e) => setElectionForm(prev => ({ ...prev, voting_end: e.target.value }))}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSetupElection} className="flex-1">
                Configure Election
              </Button>
              <Button variant="outline" onClick={() => setIsElectionDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 