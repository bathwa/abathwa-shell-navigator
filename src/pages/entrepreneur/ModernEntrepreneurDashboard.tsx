
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MetricCard } from '@/components/ui/metric-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const ModernEntrepreneurDashboard = () => {
  const { t } = useLanguage();

  // Mock data - will be replaced with real data
  const metrics = [
    {
      title: 'Total Opportunities',
      value: '12',
      change: { value: '+2 from last month', trend: 'up' as const },
      icon: TrendingUp,
    },
    {
      title: 'Capital Raised',
      value: '$247,500',
      change: { value: '+$45,000 from last month', trend: 'up' as const },
      icon: DollarSign,
    },
    {
      title: 'Active Investors',
      value: '8',
      change: { value: '+3 from last month', trend: 'up' as const },
      icon: Users,
    },
    {
      title: 'Milestones Completed',
      value: '15/18',
      change: { value: '83% completion rate', trend: 'up' as const },
      icon: Target,
    },
  ];

  const recentOpportunities = [
    {
      id: '1',
      name: 'Tech Startup Expansion',
      status: 'published',
      amount: '$50,000',
      investors: 3,
      completion: 75,
    },
    {
      id: '2',
      name: 'Manufacturing Equipment',
      status: 'draft',
      amount: '$120,000',
      investors: 0,
      completion: 45,
    },
    {
      id: '3',
      name: 'Retail Store Launch',
      status: 'under_review',
      amount: '$30,000',
      investors: 2,
      completion: 90,
    },
  ];

  const upcomingMilestones = [
    {
      id: '1',
      title: 'Product Launch',
      opportunity: 'Tech Startup Expansion',
      dueDate: '2024-02-15',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Market Research Report',
      opportunity: 'Retail Store Launch',
      dueDate: '2024-02-20',
      status: 'in_progress',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { variant: 'default' as const, label: 'Published' },
      draft: { variant: 'secondary' as const, label: 'Draft' },
      under_review: { variant: 'outline' as const, label: 'Under Review' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('common.dashboard')}</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your opportunities.
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600">
          <Link to="/entrepreneur/opportunities/new">
            <Plus className="h-4 w-4 mr-2" />
            Create Opportunity
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Recent Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Opportunities</CardTitle>
          <CardDescription>
            Your latest investment opportunities and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOpportunities.map((opportunity) => (
              <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold">{opportunity.name}</h3>
                    {getStatusBadge(opportunity.status)}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {opportunity.amount}
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {opportunity.investors} investors
                    </span>
                    <span className="flex items-center">
                      <Target className="h-4 w-4 mr-1" />
                      {opportunity.completion}% complete
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/entrepreneur/opportunities/${opportunity.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" asChild className="w-full">
              <Link to="/entrepreneur/opportunities">View All Opportunities</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
          <CardDescription>
            Important deadlines and tasks for your active opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                {getMilestoneIcon(milestone.status)}
                <div className="flex-1">
                  <h4 className="font-semibold">{milestone.title}</h4>
                  <p className="text-sm text-gray-600">{milestone.opportunity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{milestone.dueDate}</p>
                  <p className="text-xs text-gray-500">Due date</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" asChild className="w-full">
              <Link to="/entrepreneur/milestones">View All Milestones</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernEntrepreneurDashboard;
