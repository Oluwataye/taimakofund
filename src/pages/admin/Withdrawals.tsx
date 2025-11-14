import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, Wallet } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Database } from '@/integrations/supabase/types';

type Withdrawal = Database['public']['Tables']['withdrawals']['Row'] & {
  campaigns: {
    title: string;
    current_amount: number;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{ open: boolean; type: 'approve' | 'reject'; withdrawalId: string | null }>({
    open: false,
    type: 'approve',
    withdrawalId: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, campaigns(title, current_amount), profiles!creator_id(full_name)')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch withdrawals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (withdrawalId: string, action: 'approve' | 'reject') => {
    setProcessingId(withdrawalId);

    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { withdrawalId, action },
      });

      if (error) throw error;

      toast({
        title: action === 'approve' ? 'Withdrawal Approved' : 'Withdrawal Rejected',
        description: data?.message || `Withdrawal has been ${action}d`,
      });

      fetchWithdrawals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} withdrawal`,
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
      setActionDialog({ open: false, type: 'approve', withdrawalId: null });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" />Pending</Badge>;
      case 'processing':
        return <Badge className="gap-1 bg-blue-500"><Loader2 className="w-3 h-3 animate-spin" />Processing</Badge>;
      case 'completed':
        return <Badge className="gap-1 bg-green-500"><CheckCircle className="w-3 h-3" />Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
        <p className="text-muted-foreground">Review and process campaign creator withdrawal requests</p>
      </div>

      <div className="grid gap-4">
        {withdrawals.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No withdrawal requests found</p>
            </CardContent>
          </Card>
        ) : (
          withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {withdrawal.campaigns?.title || 'Unknown Campaign'}
                      {getStatusBadge(withdrawal.status)}
                    </CardTitle>
                    <CardDescription>
                      Requested by {withdrawal.profiles?.full_name || 'Unknown'} on{' '}
                      {new Date(withdrawal.requested_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">₦{Number(withdrawal.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-medium">{withdrawal.account_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Number</p>
                    <p className="font-medium">{withdrawal.account_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="font-medium">{withdrawal.bank_name}</p>
                  </div>
                </div>

                {withdrawal.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="text-sm">{withdrawal.notes}</p>
                  </div>
                )}

                {withdrawal.status === 'pending' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setActionDialog({ open: true, type: 'reject', withdrawalId: withdrawal.id })}
                      disabled={processingId === withdrawal.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setActionDialog({ open: true, type: 'approve', withdrawalId: withdrawal.id })}
                      disabled={processingId === withdrawal.id}
                    >
                      {processingId === withdrawal.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                )}

                {withdrawal.processed_at && (
                  <div className="text-sm text-muted-foreground border-t pt-4">
                    Processed on {new Date(withdrawal.processed_at).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.type === 'approve' ? 'Approve Withdrawal?' : 'Reject Withdrawal?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.type === 'approve'
                ? 'This will initiate a Paystack transfer to the provided bank account. This action cannot be undone.'
                : 'This will reject the withdrawal request. The creator can submit a new request later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => actionDialog.withdrawalId && handleAction(actionDialog.withdrawalId, actionDialog.type)}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
