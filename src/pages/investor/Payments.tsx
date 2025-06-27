import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '@/contexts/CurrencyContext';
import { AuthenticatedLayout } from '@/components/Layout/AuthenticatedLayout';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  Plus,
  Download
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'investment' | 'withdrawal' | 'fee';
  description: string;
  date: string;
  reference: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  isDefault: boolean;
  expiryDate?: string;
}

interface PaymentStats {
  totalInvested: number;
  totalWithdrawn: number;
  pendingAmount: number;
  totalFees: number;
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalInvested: 0,
    totalWithdrawn: 0,
    pendingAmount: 0,
    totalFees: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayments: Payment[] = [
        {
          id: '1',
          amount: 50000,
          currency: 'USD',
          status: 'completed',
          type: 'investment',
          description: 'Investment in Tech Startup Alpha',
          date: '2024-01-15',
          reference: 'INV-001'
        },
        {
          id: '2',
          amount: 75000,
          currency: 'USD',
          status: 'completed',
          type: 'investment',
          description: 'Investment in Green Energy Project',
          date: '2024-02-20',
          reference: 'INV-002'
        },
        {
          id: '3',
          amount: 2500,
          currency: 'USD',
          status: 'completed',
          type: 'fee',
          description: 'Platform fee for Tech Startup Alpha',
          date: '2024-01-15',
          reference: 'FEE-001'
        },
        {
          id: '4',
          amount: 10000,
          currency: 'USD',
          status: 'pending',
          type: 'withdrawal',
          description: 'Withdrawal to bank account',
          date: '2024-03-01',
          reference: 'WTH-001'
        }
      ];

      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          isDefault: true,
          expiryDate: '12/25'
        },
        {
          id: '2',
          type: 'bank',
          last4: '1234',
          brand: 'Chase Bank',
          isDefault: false
        }
      ];

      setPayments(mockPayments);
      setPaymentMethods(mockPaymentMethods);

      // Calculate stats
      const totalInvested = mockPayments
        .filter(p => p.type === 'investment' && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalWithdrawn = mockPayments
        .filter(p => p.type === 'withdrawal' && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const pendingAmount = mockPayments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
      
      const totalFees = mockPayments
        .filter(p => p.type === 'fee' && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalInvested,
        totalWithdrawn,
        pendingAmount,
        totalFees
      });
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Failed
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'investment':
        return <Badge className="bg-blue-100 text-blue-800">Investment</Badge>;
      case 'withdrawal':
        return <Badge className="bg-purple-100 text-purple-800">Withdrawal</Badge>;
      case 'fee':
        return <Badge className="bg-gray-100 text-gray-800">Fee</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg">Loading payments...</div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payments & Transactions</h1>
          <p className="text-muted-foreground">Manage your payment methods and view transaction history</p>
        </div>

        {/* Payment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</div>
              <p className="text-xs text-muted-foreground">
                All completed investments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalWithdrawn)}</div>
              <p className="text-xs text-muted-foreground">
                All completed withdrawals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Transactions in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalFees)}</div>
              <p className="text-xs text-muted-foreground">
                Platform fees paid
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
            <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All your payment transactions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold">{payment.description}</h3>
                              {getStatusBadge(payment.status)}
                              {getTypeBadge(payment.type)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(payment.date).toLocaleDateString()}</span>
                              </span>
                              <span>Ref: {payment.reference}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-semibold">
                              {payment.type === 'withdrawal' ? '-' : '+'}{formatCurrency(payment.amount)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.currency}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your transaction history will appear here
                    </p>
                    <Button onClick={() => navigate('/investor/dashboard')}>
                      Start Investing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your payment methods</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center">
                              {method.type === 'card' ? (
                                <CreditCard className="h-5 w-5 text-gray-600" />
                              ) : (
                                <DollarSign className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {method.brand} •••• {method.last4}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {method.type === 'card' && method.expiryDate && `Expires ${method.expiryDate}`}
                                {method.type === 'bank' && 'Bank Account'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {method.isDefault && (
                              <Badge className="bg-green-100 text-green-800">Default</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                    <p className="text-muted-foreground mb-4">
                      Add a payment method to start investing
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
} 