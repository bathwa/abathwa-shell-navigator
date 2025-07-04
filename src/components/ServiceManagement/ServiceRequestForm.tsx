import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

interface ServiceProvider {
  id: string;
  user_id: string;
  company_name: string;
  service_category: string;
  rating: number;
  is_verified: boolean;
  user: {
    full_name: string;
  };
}

interface ServiceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId?: string;
}

export function ServiceRequestForm({ open, onOpenChange, opportunityId }: ServiceRequestFormProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    service_category_id: '',
    scope_description: '',
    deliverables: [''],
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    proposed_budget: '',
    broadcast_to_all: false,
    selected_service_provider_ids: [] as string[]
  });

  useEffect(() => {
    if (open) {
      loadCategories();
      loadServiceProviders();
    }
  }, [open]);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');
    
    if (!error && data) {
      setCategories(data);
    }
  };

  const loadServiceProviders = async () => {
    const { data, error } = await supabase
      .from('service_providers')
      .select(`
        *,
        user:profiles!service_providers_user_id_fkey(full_name)
      `)
      .eq('is_verified', true)
      .order('rating', { ascending: false });
    
    if (!error && data) {
      setServiceProviders(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_requests')
        .insert({
          entrepreneur_id: user.id,
          title: `${categories.find(c => c.id === formData.service_category_id)?.name || 'Service'} Request`,
          description: formData.scope_description,
          service_category: categories.find(c => c.id === formData.service_category_id)?.name || '',
          budget: formData.proposed_budget ? parseFloat(formData.proposed_budget) : null,
          deadline: formData.end_date?.toISOString().split('T')[0] || null,
          status: 'published'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service request created successfully.",
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating service request:', error);
      toast({
        title: "Error",
        description: "Failed to create service request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      service_category_id: '',
      scope_description: '',
      deliverables: [''],
      start_date: undefined,
      end_date: undefined,
      proposed_budget: '',
      broadcast_to_all: false,
      selected_service_provider_ids: []
    });
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => i === index ? value : d)
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const toggleServiceProvider = (providerId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_service_provider_ids: prev.selected_service_provider_ids.includes(providerId)
        ? prev.selected_service_provider_ids.filter(id => id !== providerId)
        : [...prev.selected_service_provider_ids, providerId],
      broadcast_to_all: false
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Service Request</DialogTitle>
          <DialogDescription>
            Request professional services from verified service providers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Service Category</Label>
            <Select value={formData.service_category_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, service_category_id: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select a service category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scope Description */}
          <div className="space-y-2">
            <Label htmlFor="scope">Scope Description</Label>
            <Textarea
              id="scope"
              placeholder="Describe the work you need done in detail..."
              value={formData.scope_description}
              onChange={(e) => setFormData(prev => ({ ...prev, scope_description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <Label>Expected Deliverables</Label>
            {formData.deliverables.map((deliverable, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={deliverable}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  placeholder={`Deliverable ${index + 1}`}
                />
                {formData.deliverables.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeDeliverable(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addDeliverable}>
              Add Deliverable
            </Button>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, end_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Proposed Budget (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="budget"
                type="number"
                placeholder="0.00"
                value={formData.proposed_budget}
                onChange={(e) => setFormData(prev => ({ ...prev, proposed_budget: e.target.value }))}
                className="pl-10"
              />
            </div>
          </div>

          {/* Service Provider Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Service Provider Selection</Label>
              <Button
                type="button"
                variant={formData.broadcast_to_all ? "default" : "outline"}
                size="sm"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  broadcast_to_all: !prev.broadcast_to_all,
                  selected_service_provider_ids: []
                }))}
              >
                <Users className="mr-2 h-4 w-4" />
                Broadcast to All
              </Button>
            </div>

            {!formData.broadcast_to_all && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                {serviceProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`cursor-pointer transition-colors ${
                      formData.selected_service_provider_ids.includes(provider.id)
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleServiceProvider(provider.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{provider.company_name}</h4>
                        {provider.is_verified && <Badge variant="secondary">Verified</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{provider.user.full_name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{provider.service_category}</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium">★ {provider.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Service Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}