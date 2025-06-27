import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Users, 
  Target, 
  Calendar, 
  DollarSign, 
  Vote, 
  Award,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  MessageSquare,
  FileText,
  Download,
  Eye,
  Plus,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

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

interface PoolDiscussion {
  id: string;
  pool_id: string;
  title: string;
  content: string;
  created_by: string;
  status: 'open' | 'closed';
  created_at: string;
  closed_at?: string;
  creator?: {
    full_name: string;
    email: string;
  };
}

interface PoolReport {
  id: string;
  pool_id: string;
  title: string;
  content: string;
  report_month: string;
  report_year: number;
  created_at: string;
  ai_summary?: string;
  drbe_insights?: string;
}

interface PoolInvestment {
  id: string;
  pool_id: string;
  opportunity_id: string;
  amount: number;
  status: string;
  created_at: string;
  opportunity?: {
    name: string;
    description: string;
    expected_roi: number;
    entrepreneur?: {
      full_name: string;
    };
  };
}

interface PoolObjective {
  id: string;
  pool_id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  contribution_type: 'recurring' | 'one_time' | 'goal_based';
  frequency?: 'weekly' | 'monthly' | 'quarterly';
  due_date?: string;
  status: 'active' | 'completed' | 'overdue';
  created_at: string;
}

export default function PoolDashboard() {
  const { poolId } = useParams<{ poolId: string }>();
  const { toast } = useToast();
  const { user } = useAuthStore();
  
  const [pool, setPool] = useState<any>(null);
  const [members, setMembers] = useState<PoolMember[]>([]);
  const [discussions, setDiscussions] = useState<PoolDiscussion[]>([]);
  const [reports, setReports] = useState<PoolReport[]>([]);
  const [investments, setInvestments] = useState<PoolInvestment[]>([]);
  const [objectives, setObjectives] = useState<PoolObjective[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview');
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });

  const isPoolLeader = pool?.current_leader_id === user?.id;
  const isPoolAdmin = pool?.created_by === user?.id;

  useEffect(() => {
    if (poolId) {
      loadPoolData();
    }
  }, [poolId, user]);

  const loadPoolData = async () => {
    if (!poolId || !user) return;

    try {
      setIsLoading(true);

      // Load pool details
      const { data: poolData, error: poolError } = await supabase
        .from('investment_pools')
        .select(`
          *,
          creator:profiles!investment_pools_created_by_fkey(full_name, email),
          current_leader:profiles!investment_pools_current_leader_id_fkey(full_name, email)
        `)
        .eq('id', poolId)
        .single();

      if (poolError) throw poolError;
      setPool(poolData);

      // Load pool members
      const { data: membersData, error: membersError } = await supabase
        .from('pool_members')
        .select(`
          *,
          member:profiles!pool_members_member_id_fkey(full_name, email, role)
        `)
        .eq('pool_id', poolId)
        .eq('is_active', true);

      if (membersError) throw membersError;
      setMembers(membersData || []);

      // Load pool discussions
      const { data: discussionsData, error: discussionsError } = await supabase
        .from('pool_discussions')
        .select(`
          *,
          creator:profiles!pool_discussions_created_by_fkey(full_name, email)
        `)
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (discussionsError) throw discussionsError;
      setDiscussions(discussionsData || []);

      // Load pool reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('pool_reports')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;
      setReports(reportsData || []);

      // Load pool investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('pool_investments')
        .select(`
          *,
          opportunity:opportunities!pool_investments_opportunity_id_fkey(
            *,
            entrepreneur:profiles!opportunities_entrepreneur_id_fkey(full_name)
          )
        `)
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (investmentsError) throw investmentsError;
      setInvestments(investmentsData || []);

      // Load pool objectives
      const { data: objectivesData, error: objectivesError } = await supabase
        .from('pool_objectives')
        .select('*')
        .eq('pool_id', poolId)
        .order('created_at', { ascending: false });

      if (objectivesError) throw objectivesError;
      setObjectives(objectivesData || []);

    } catch (error) {
      console.error('Error loading pool data:', error);
      toast({
        title: "Error",
        description: "Failed to load pool data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDiscussion = async () => {
    if (!poolId || !user) return;

    try {
      const { error } = await supabase
        .from('pool_discussions')
        .insert({
          pool_id: poolId,
          title: newDiscussion.title,
          content: newDiscussion.content,
          created_by: user.id,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion created successfully.",
      });

      setIsDiscussionDialogOpen(false);
      setNewDiscussion({ title: '', content: '' });
      loadPoolData();
    } catch (error) {
      console.error('Error creating discussion:', error);
      toast({
        title: "Error",
        description: "Failed to create discussion.",
        variant: "destructive",
      });
    }
  };

  const handleCloseDiscussion = async (discussionId: string) => {
    try {
      const { error } = await supabase
        .from('pool_discussions')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', discussionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discussion closed successfully.",
      });

      loadPoolData();
    } catch (error) {
      console.error('Error closing discussion:', error);
      toast({
        title: "Error",
        description: "Failed to close discussion.",
        variant: "destructive",
      });
    }
  };

  const downloadReport = async (report: PoolReport) => {
    try {
      // Generate markdown report
      const reportContent = `# ${report.title}

**Pool:** ${pool?.name}
**Report Period:** ${report.report_month} ${report.report_year}
**Generated:** ${new Date(report.created_at).toLocaleDateString()}

## Executive Summary
${report.content}

${report.ai_summary ? `## AI Insights
${report.ai_summary}` : ''}

${report.drbe_insights ? `## DRBE Analysis
${report.drbe_insights}` : ''}

## Pool Statistics
- Total Members: ${members.length}
- Total Contributions: $${members.reduce((sum, m) => sum + (m.investment_contribution || 0), 0).toLocaleString()}
- Active Investments: ${investments.filter(i => i.status === 'active').length}
- Pool Objectives: ${objectives.filter(o => o.status === 'active').length}

## Recent Activities
${discussions.slice(0, 5).map(d => `- **${d.title}** (${d.status}) - ${new Date(d.created_at).toLocaleDateString()}`).join('\n')}

---
*Report generated by Abathwa Capital Platform*
`;

      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pool?.name}_Report_${report.report_month}_${report.report_year}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report downloaded successfully.",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'default' as const, label: 'Open' },
      closed: { variant: 'secondary' as const, label: 'Closed' },
      active: { variant: 'default' as const, label: 'Active' },
      completed: { variant: 'secondary' as const, label: 'Completed' },
      overdue: { variant: 'destructive' as const, label: 'Overdue' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading pool dashboard...</div>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-8">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Pool not found</h3>
          <p className="text-muted-foreground">The requested pool could not be found.</p>
        </div>
      </div>
    );
  }

  const totalContributions = members.reduce((sum, m) => sum + (m.investment_contribution || 0), 0);
  const activeInvestments = investments.filter(i => i.status === 'active');
  const activeObjectives = objectives.filter(o => o.status === 'active');

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{pool.name}</h1>
          <p className="text-muted-foreground">{pool.description}</p>
        </div>
        
        {(isPoolLeader || isPoolAdmin) && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsDiscussionDialogOpen(true)}
              disabled={!isPoolLeader}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              New Discussion
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Pool Settings
            </Button>
          </div>
        )}
      </div>

      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              Active pool members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contributions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalContributions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${pool.current_amount?.toLocaleString()} / ${pool.target_amount?.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvestments.length}</div>
            <p className="text-xs text-muted-foreground">
              Current investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Objectives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeObjectives.length}</div>
            <p className="text-xs text-muted-foreground">
              Active goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pool Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pool Progress</CardTitle>
          <CardDescription>
            Funding progress towards pool target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Funding Progress</span>
              <span>{Math.round((pool.current_amount / pool.target_amount) * 100)}%</span>
            </div>
            <Progress value={Math.min((pool.current_amount / pool.target_amount) * 100, 100)} />
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {discussions.slice(0, 5).map((discussion) => (
                  <div key={discussion.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div>
                        <p className="font-medium">{discussion.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {discussion.creator?.full_name} • {new Date(discussion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(discussion.status)}
                  </div>
                ))}
                
                {discussions.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No recent discussions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pool Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Pool Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Funding Progress</span>
                    <span>{Math.round((pool.current_amount / pool.target_amount) * 100)}%</span>
                  </div>
                  <Progress value={Math.min((pool.current_amount / pool.target_amount) * 100, 100)} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Active Objectives</span>
                    <span>{activeObjectives.length} / {objectives.length}</span>
                  </div>
                  <Progress value={objectives.length > 0 ? (activeObjectives.length / objectives.length) * 100 : 0} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Investment Diversity</span>
                    <span>{activeInvestments.length} opportunities</span>
                  </div>
                  <Progress value={Math.min(activeInvestments.length * 20, 100)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Discussions</CardTitle>
              <CardDescription>
                Discussions initiated by pool leadership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discussions.map((discussion) => (
                  <div key={discussion.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{discussion.title}</h3>
                          {getStatusBadge(discussion.status)}
                        </div>
                        <p className="text-muted-foreground">{discussion.content}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{discussion.creator?.full_name}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(discussion.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      
                      {(isPoolLeader || isPoolAdmin) && discussion.status === 'open' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCloseDiscussion(discussion.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Close Discussion
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {discussions.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No discussions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Pool leadership can initiate discussions on specific topics
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Investments</CardTitle>
              <CardDescription>
                Investment opportunities the pool has participated in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{investment.opportunity?.name}</h3>
                          {getStatusBadge(investment.status)}
                        </div>
                        <p className="text-muted-foreground">{investment.opportunity?.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${investment.amount?.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{investment.opportunity?.expected_roi}% ROI</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{investment.opportunity?.entrepreneur?.full_name}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(investment.created_at).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/opportunities/${investment.opportunity_id}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {investments.length === 0 && (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No investments yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Pool leadership can invest in opportunities on behalf of the pool
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Objectives Tab */}
        <TabsContent value="objectives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Objectives</CardTitle>
              <CardDescription>
                Pool goals and contribution targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {objectives.map((objective) => (
                  <div key={objective.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{objective.title}</h3>
                          {getStatusBadge(objective.status)}
                          <Badge variant="outline">{objective.contribution_type}</Badge>
                        </div>
                        <p className="text-muted-foreground">{objective.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${objective.current_amount?.toLocaleString()} / ${objective.target_amount?.toLocaleString()}</span>
                          </span>
                          {objective.frequency && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{objective.frequency}</span>
                            </span>
                          )}
                          {objective.due_date && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due {new Date(objective.due_date).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((objective.current_amount / objective.target_amount) * 100)}%</span>
                      </div>
                      <Progress value={Math.min((objective.current_amount / objective.target_amount) * 100, 100)} />
                    </div>
                  </div>
                ))}
                
                {objectives.length === 0 && (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No objectives yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Pool leadership can set objectives and contribution targets
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Reports</CardTitle>
              <CardDescription>
                Monthly reports with AI insights and DRBE analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{report.title}</h3>
                          <Badge variant="outline">{report.report_month} {report.report_year}</Badge>
                        </div>
                        <p className="text-muted-foreground">{report.content.substring(0, 200)}...</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(report.created_at).toLocaleDateString()}</span>
                          </span>
                          {report.ai_summary && (
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4" />
                              <span>AI Insights</span>
                            </span>
                          )}
                          {report.drbe_insights && (
                            <span className="flex items-center space-x-1">
                              <BarChart3 className="h-4 w-4" />
                              <span>DRBE Analysis</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
                
                {reports.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Monthly reports are automatically generated with AI insights
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pool Members</CardTitle>
              <CardDescription>
                Current pool members and their contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Discussion Dialog */}
      {isDiscussionDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Create New Discussion</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded"
                  placeholder="Discussion title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={newDiscussion.content}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border rounded h-32"
                  placeholder="Discussion content"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateDiscussion} className="flex-1">
                  Create Discussion
                </Button>
                <Button variant="outline" onClick={() => setIsDiscussionDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 