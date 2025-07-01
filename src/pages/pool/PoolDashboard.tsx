
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModernLayout } from '@/components/Layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Target,
  Calendar,
  Vote,
  Crown,
  Settings,
  Plus,
  ArrowLeft
} from 'lucide-react';

interface Pool {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: string;
  created_by: string;
  current_leader_id?: string;
  created_at: string;
  updated_at: string;
}

interface PoolMember {
  id: string;
  pool_id: string;
  member_id: string;
  investment_contribution: number;
  is_active: boolean;
  joined_at: string;
  member: {
    full_name: string;
    email: string;
    role: string;
  } | null;
}

interface PoolDiscussion {
  id: string;
  pool_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: 'open' | 'closed';
  creator: {
    full_name: string;
    email: string;
  } | null;
}

interface PoolObjective {
  id: string;
  pool_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  due_date?: string;
  status: string;
  contribution_type: 'recurring' | 'one_time' | 'goal_based';
  frequency?: string;
  created_at: string;
  updated_at: string;
}

export default function PoolDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [pool, setPool] = useState<Pool | null>(null);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [discussions, setDiscussions] = useState<PoolDiscussion[]>([]);
  const [objectives, setObjectives] = useState<PoolObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      loadPoolData();
    }
  }, [id]);

  const loadPoolData = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load pool details
      const { data: poolData, error: poolError } = await supabase
        .from('investment_pools')
        .select('*')
        .eq('id', id)
        .single();

      if (poolError) throw poolError;
      setPool(poolData);

      // Load pool members
      const { data: membersData, error: membersError } = await supabase
        .from('pool_members')
        .select(`
          *,
          member:profiles!pool_members_member_id_fkey(
            full_name,
            role
          )
        `)
        .eq('pool_id', id)
        .eq('is_active', true);

      if (membersError) {
        console.error('Error loading members:', membersError);
      } else {
        // Process members data to handle potential null/error values
        const processedMembers = (membersData || []).map(member => ({
          ...member,
          member: member.member && typeof member.member === 'object' && 'full_name' in member.member 
            ? { ...member.member, email: 'email@example.com' } // Placeholder since email is not in profiles
            : null
        }));
        setMembers(processedMembers);
      }

      // Load discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('pool_discussions')
        .select(`
          *,
          creator:profiles!pool_discussions_created_by_fkey(
            full_name
          )
        `)
        .eq('pool_id', id)
        .order('created_at', { ascending: false });

      if (discussionsError) {
        console.error('Error loading discussions:', discussionsError);
      } else {
        // Process discussions data to handle potential null/error values
        const processedDiscussions = (discussionsData || []).map(discussion => ({
          ...discussion,
          status: discussion.status as 'open' | 'closed',
          creator: discussion.creator && typeof discussion.creator === 'object' && 'full_name' in discussion.creator 
            ? { ...discussion.creator, email: 'email@example.com' } // Placeholder
            : null
        }));
        setDiscussions(processedDiscussions);
      }

      // Load objectives
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('pool_objectives')
        .select('*')
        .eq('pool_id', id)
        .order('created_at', { ascending: false });

      if (objectivesError) {
        console.error('Error loading objectives:', objectivesError);
      } else {
        // Process objectives data to handle contribution_type enum
        const processedObjectives = (objectivesData || []).map(objective => ({
          ...objective,
          contribution_type: objective.contribution_type as 'recurring' | 'one_time' | 'goal_based'
        }));
        setObjectives(processedObjectives);
      }

    } catch (error) {
      console.error('Error loading pool data:', error);
      toast({
        title: "Error",
        description: "Failed to load pool data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const isPoolAdmin = () => {
    return pool && user && (pool.created_by === user.id || pool.current_leader_id === user.id);
  };

  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-lg">Loading pool...</div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (!pool) {
    return (
      <ModernLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Pool Not Found</h2>
            <p className="text-muted-foreground mb-4">The investment pool you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/investor/pools')}>
              Back to Pools
            </Button>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/investor/pools')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pools
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{pool.name}</h1>
              <p className="text-muted-foreground mb-4">{pool.description}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{pool.status.toUpperCase()}</Badge>
                <Badge variant="secondary">{members.length} Members</Badge>
              </div>
            </div>
            
            {isPoolAdmin() && (
              <div className="flex gap-2">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Pool
                </Button>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Members
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Pool Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pool Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pool.current_amount)}</div>
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(pool.target_amount)} target
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Active members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Objectives</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{objectives.length}</div>
              <p className="text-xs text-muted-foreground">
                Active objectives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discussions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{discussions.length}</div>
              <p className="text-xs text-muted-foreground">
                Open discussions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pool Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p>{pool.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p>{new Date(pool.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Amount</p>
                    <p className="font-semibold">{formatCurrency(pool.target_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Amount</p>
                    <p className="font-semibold text-green-600">{formatCurrency(pool.current_amount)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {discussions.slice(0, 3).map((discussion) => (
                      <div key={discussion.id} className="border-l-2 border-blue-500 pl-3">
                        <p className="font-medium text-sm">{discussion.title}</p>
                        <p className="text-xs text-muted-foreground">
                          by {discussion.creator?.full_name || 'Unknown'} • {new Date(discussion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {discussions.length === 0 && (
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pool Members ({members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.member?.full_name || 'Unknown Member'}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.member?.role && <span className="capitalize">{member.member.role}</span>}
                          {member.member?.role && ' • '}
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(member.investment_contribution)}</p>
                        <p className="text-sm text-muted-foreground">Contributed</p>
                      </div>
                    </div>
                  ))}
                  {members.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No members yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objectives" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pool Objectives</CardTitle>
                  {isPoolAdmin() && (
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Objective
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {objectives.map((objective) => (
                    <div key={objective.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{objective.title}</h4>
                        <Badge variant="outline">{objective.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{objective.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Target Amount</p>
                          <p className="font-medium">{formatCurrency(objective.target_amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Amount</p>
                          <p className="font-medium text-green-600">{formatCurrency(objective.current_amount)}</p>
                        </div>
                        {objective.due_date && (
                          <div>
                            <p className="text-muted-foreground">Due Date</p>
                            <p className="font-medium">{new Date(objective.due_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{objective.contribution_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {objectives.length === 0 && (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No objectives set</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discussions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pool Discussions</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Start Discussion
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{discussion.title}</h4>
                        <Badge variant={discussion.status === 'open' ? 'default' : 'secondary'}>
                          {discussion.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{discussion.content}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Started by {discussion.creator?.full_name || 'Unknown'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {discussions.length === 0 && (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No discussions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="elections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Leadership Elections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No active elections</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Next election cycle: January 10, 2025
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
