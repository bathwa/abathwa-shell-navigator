import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

export default function ServiceProviderDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('assigned');
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    rating: 0,
    reviewCount: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    // Fetch assigned service requests
    const { data: providerData } = await supabase
      .from('service_providers')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (!providerData) {
      setIsLoading(false);
      return;
    }
    const { data: requestsData } = await supabase
      .from('service_requests')
      .select('*')
      .eq('assigned_provider_id', providerData.id);
    setRequests(requestsData || []);
    setStats({
      completed: requestsData?.filter(r => r.status === 'completed').length || 0,
      pending: requestsData?.filter(r => r.status !== 'completed').length || 0,
      rating: providerData.rating || 0,
      reviewCount: providerData.review_count || 0
    });
    setIsLoading(false);
  };

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-4 max-w-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-7xl flex flex-col items-center justify-center min-h-screen">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Service Provider Dashboard</h1>
        </div>
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.reviewCount}</div>
            </CardContent>
          </Card>
        </div>
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assigned">Assigned Requests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <TabsContent value="assigned">
            <div className="space-y-4">
              {requests.filter(r => r.status !== 'completed').map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>{request.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">{request.description}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Budget: {request.budget}</span>
                      <Button size="sm" onClick={() => navigate(`/service-requests/${request.id}`)}>View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {requests.filter(r => r.status !== 'completed').length === 0 && (
                <div className="text-center text-muted-foreground py-8">No assigned requests</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="completed">
            <div className="space-y-4">
              {requests.filter(r => r.status === 'completed').map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>{request.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">{request.description}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Budget: {request.budget}</span>
                      <Button size="sm" onClick={() => navigate(`/service-requests/${request.id}`)}>View</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {requests.filter(r => r.status === 'completed').length === 0 && (
                <div className="text-center text-muted-foreground py-8">No completed requests</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
} 