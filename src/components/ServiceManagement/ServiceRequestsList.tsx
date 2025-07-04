import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Calendar, DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useCurrency } from '@/contexts/CurrencyContext';

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  service_category: string;
  status: string;
  budget: number;
  deadline: string;
  created_at: string;
  assigned_provider_id: string | null;
}

export function ServiceRequestsList() {
  const { user } = useAuthStore();
  const { formatCurrency } = useCurrency();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadServiceRequests();
    }
  }, [user]);

  const loadServiceRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('entrepreneur_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading service requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { variant: 'secondary' as const, label: 'Draft', icon: FileText },
      'published': { variant: 'default' as const, label: 'Published', icon: Clock },
      'assigned': { variant: 'default' as const, label: 'Assigned', icon: Eye },
      'in_progress': { variant: 'default' as const, label: 'In Progress', icon: Eye },
      'completed': { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      'cancelled': { variant: 'destructive' as const, label: 'Cancelled', icon: FileText },
      'review_pending': { variant: 'outline' as const, label: 'Under Review', icon: Clock }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const filterRequestsByStatus = (status: string) => {
    return requests.filter(request => request.status === status);
  };

  const RequestCard = ({ request }: { request: ServiceRequest }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription className="mt-1">{request.service_category}</CardDescription>
          </div>
          {getStatusBadge(request.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {request.description}
        </p>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            {request.budget && (
              <span className="flex items-center space-x-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(request.budget)}</span>
              </span>
            )}
            {request.deadline && (
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(request.deadline).toLocaleDateString()}</span>
              </span>
            )}
          </div>
          
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading service requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Service Requests</h3>
        <p className="text-muted-foreground">Manage your professional service requests</p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
          <TabsTrigger value="pending">Published ({filterRequestsByStatus('published').length})</TabsTrigger>
          <TabsTrigger value="active">Active ({filterRequestsByStatus('in_progress').length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({filterRequestsByStatus('completed').length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({filterRequestsByStatus('draft').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No service requests yet</h3>
                <p className="text-muted-foreground">Create your first service request to get started</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterRequestsByStatus('published').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterRequestsByStatus('in_progress').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterRequestsByStatus('completed').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterRequestsByStatus('draft').map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}