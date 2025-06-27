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
  Shield, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download,
  Upload,
  AlertTriangle,
  Banknote,
  CreditCard,
  Building,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface EscrowAccount {
  id: string;
  opportunity_id: string;
  account_holder_id: string;
  balance: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  opportunity?: {
    name: string;
    entrepreneur_id: string;
  };
  account_holder?: {
    full_name: string;
    email: string;
  };
}

interface Payment {
  id: string;
  opportunity_id?: string;
  sender_id: string;
  receiver_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  status: string;
  transaction_ref?: string;
  payment_method?: string;
  payer_proof_url?: string;
  admin_confirm_at?: string;
  admin_onward_proof_url?: string;
  notes?: string;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
  receiver?: {
    full_name: string;
    email: string;
  };
}

export default function EscrowManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useAuthStore();
  
  const [escrowAccounts, setEscrowAccounts] = useState<EscrowAccount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('accounts');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    currency: 'USD',
    payment_method: 'bank_transfer',
    notes: ''
  });

  const [proofForm, setProofForm] = useState({
    proof_url: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load escrow accounts
      const { data: escrowData, error: escrowError } = await supabase
        .from('escrow_accounts')
        .select(`
          *,
          opportunity:opportunities!escrow_accounts_opportunity_id_fkey(name, entrepreneur_id),
          account_holder:profiles!escrow_accounts_account_holder_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (escrowError) throw escrowError;
      setEscrowAccounts(escrowData || []);

      // Load payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          sender:profiles!payments_sender_id_fkey(full_name, email),
          receiver:profiles!payments_receiver_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load escrow data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'admin_review',
          admin_confirm_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment confirmed successfully.",
      });

      loadData();
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: "Failed to confirm payment.",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (paymentId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({
          status: 'failed',
          notes: `Rejected: ${reason}`
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment rejected successfully.",
      });

      loadData();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Failed to reject payment.",
        variant: "destructive",
      });
    }
  };

  const handleUploadProof = async () => {
    if (!selectedPayment) return;

    try {
      const { error } = await supabase
        .from('payments')
        .update({
          admin_onward_proof_url: proofForm.proof_url,
          status: 'onward_transfer_pending',
          notes: proofForm.notes
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Proof of payment uploaded successfully.",
      });

      setIsProofDialogOpen(false);
      setProofForm({ proof_url: '', notes: '' });
      loadData();
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: "Error",
        description: "Failed to upload proof of payment.",
        variant: "destructive",
      });
    }
  };

  const generatePaymentVoucher = (payment: Payment) => {
    const voucher = {
      reference: payment.transaction_ref || `PAY-${payment.id.slice(0, 8)}`,
      amount: payment.amount,
      currency: payment.currency,
      account_details: {
        bank_name: "Abathwa Capital Escrow Account",
        account_number: "1234567890",
        account_name: "Abathwa Capital Trust Account",
        swift_code: "ABATZA22",
        iban: "ZA12345678901234567890"
      },
      instructions: "Please include the reference number in your payment description",
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    const voucherText = `
PAYMENT VOUCHER
================

Reference: ${voucher.reference}
Amount: ${voucher.currency} ${voucher.amount.toLocaleString()}
Valid Until: ${new Date(voucher.valid_until).toLocaleDateString()}

Bank Details:
Bank: ${voucher.account_details.bank_name}
Account: ${voucher.account_details.account_number}
Name: ${voucher.account_details.account_name}
Swift: ${voucher.account_details.swift_code}
IBAN: ${voucher.account_details.iban}

Instructions:
${voucher.instructions}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([voucherText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-voucher-${voucher.reference}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      initiated: { variant: 'secondary' as const, label: 'Initiated' },
      pending_proof: { variant: 'default' as const, label: 'Pending Proof' },
      admin_review: { variant: 'default' as const, label: 'Admin Review' },
      onward_transfer_pending: { variant: 'default' as const, label: 'Transfer Pending' },
      completed: { variant: 'default' as const, label: 'Completed' },
      failed: { variant: 'destructive' as const, label: 'Failed' },
      refunded: { variant: 'outline' as const, label: 'Refunded' },
      cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.initiated;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getEscrowStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'default' as const, label: 'Active' },
      closed: { variant: 'secondary' as const, label: 'Closed' },
      suspended: { variant: 'destructive' as const, label: 'Suspended' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentTypeIcon = (type: string) => {
    switch (type) {
      case 'investment':
        return <TrendingUp className="h-4 w-4" />;
      case 'service_fee':
        return <Shield className="h-4 w-4" />;
      case 'milestone_payout':
        return <CheckCircle className="h-4 w-4" />;
      case 'admin_transfer':
        return <Building className="h-4 w-4" />;
      case 'refund':
        return <XCircle className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Escrow Management</h1>
          <p className="text-muted-foreground">Manage manual and integrated escrow accounts</p>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Escrow Accounts</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Escrow Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Accounts</CardTitle>
              <CardDescription>
                Monitor escrow account balances and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading escrow accounts...</div>
                </div>
              ) : escrowAccounts.length > 0 ? (
                <div className="space-y-4">
                  {escrowAccounts.map((account) => (
                    <div key={account.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">
                              {account.opportunity?.name || 'Unknown Opportunity'}
                            </h3>
                            {getEscrowStatusBadge(account.status)}
                          </div>
                          <p className="text-muted-foreground">
                            Account Holder: {account.account_holder?.full_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{account.currency} {account.balance?.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Created {new Date(account.created_at).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No escrow accounts yet</h3>
                  <p className="text-muted-foreground">
                    Escrow accounts will be created automatically when opportunities are funded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Review and approve payments, upload proof of transfers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading payments...</div>
                </div>
              ) : payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            {getPaymentTypeIcon(payment.payment_type)}
                            <h3 className="text-lg font-semibold">
                              {payment.payment_type.replace('_', ' ').toUpperCase()}
                            </h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-muted-foreground">
                            From: {payment.sender?.full_name} → To: {payment.receiver?.full_name}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{payment.currency} {payment.amount?.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                            </span>
                            {payment.transaction_ref && (
                              <span className="flex items-center space-x-1">
                                <CreditCard className="h-4 w-4" />
                                <span>Ref: {payment.transaction_ref}</span>
                              </span>
                            )}
                          </div>
                          {payment.notes && (
                            <p className="text-sm text-muted-foreground">
                              Notes: {payment.notes}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {payment.status === 'pending_proof' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setIsPaymentDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleConfirmPayment(payment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRejectPayment(payment.id, 'Invalid proof')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          {payment.status === 'admin_review' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsProofDialogOpen(true);
                              }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Proof
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generatePaymentVoucher(payment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {payment.payer_proof_url && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Proof of Payment:</p>
                          <a 
                            href={payment.payer_proof_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View Proof Document
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Banknote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
                  <p className="text-muted-foreground">
                    Payments will appear here when users make transactions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Total Escrow Balance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${escrowAccounts.reduce((sum, account) => sum + account.balance, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all active accounts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Total Payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.length}</div>
                <p className="text-xs text-muted-foreground">
                  All time transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Completed Payments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {payments.filter(p => p.status === 'completed').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully processed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Review Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Payment</DialogTitle>
            <DialogDescription>
              Review payment details and proof of payment
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label>Amount</Label>
                <p className="text-lg font-medium">
                  {selectedPayment.currency} {selectedPayment.amount?.toLocaleString()}
                </p>
              </div>
              <div>
                <Label>From</Label>
                <p>{selectedPayment.sender?.full_name} ({selectedPayment.sender?.email})</p>
              </div>
              <div>
                <Label>To</Label>
                <p>{selectedPayment.receiver?.full_name} ({selectedPayment.receiver?.email})</p>
              </div>
              {selectedPayment.payer_proof_url && (
                <div>
                  <Label>Proof of Payment</Label>
                  <a 
                    href={selectedPayment.payer_proof_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    View Proof Document
                  </a>
                </div>
              )}
              <div className="flex space-x-2">
                <Button onClick={() => handleConfirmPayment(selectedPayment.id)} className="flex-1">
                  Confirm Payment
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleRejectPayment(selectedPayment.id, 'Invalid proof')} 
                  className="flex-1"
                >
                  Reject Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Upload Proof Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Proof of Transfer</DialogTitle>
            <DialogDescription>
              Upload proof that the payment has been transferred to the recipient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Proof URL</Label>
              <Input
                value={proofForm.proof_url}
                onChange={(e) => setProofForm(prev => ({ ...prev, proof_url: e.target.value }))}
                placeholder="Enter URL to proof document"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={proofForm.notes}
                onChange={(e) => setProofForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the transfer"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleUploadProof} className="flex-1">
                Upload Proof
              </Button>
              <Button variant="outline" onClick={() => setIsProofDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 