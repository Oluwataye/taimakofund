import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye, Search, FileText } from 'lucide-react';
import { VerificationDocumentsDialog } from '@/components/admin/VerificationDocumentsDialog';
import type { Database } from '@/integrations/supabase/types';

type Campaign = Database['public']['Tables']['campaigns']['Row'] & {
  profiles: {
    full_name: string;
    phone_number: string | null;
  } | null;
};

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('campaigns')
        .select('*, profiles(full_name, phone_number)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as Database['public']['Enums']['campaign_status']);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCampaigns(data as Campaign[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCampaignStatus = async (
    campaignId: string,
    status: 'active' | 'rejected'
  ) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status, verified: status === 'active' })
        .eq('id', campaignId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Campaign ${status === 'active' ? 'approved' : 'rejected'} successfully`,
      });

      fetchCampaigns();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      active: { variant: 'default', label: 'Active' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      completed: { variant: 'outline', label: 'Completed' },
      suspended: { variant: 'destructive', label: 'Suspended' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <p className="text-muted-foreground">Review and manage campaigns</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No campaigns found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Raised</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-xs">
                        <p className="truncate">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(campaign.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.profiles?.full_name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.category}</Badge>
                    </TableCell>
                    <TableCell>₦{Number(campaign.goal_amount).toLocaleString()}</TableCell>
                    <TableCell>₦{Number(campaign.current_amount).toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status || 'draft')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCampaign(campaign)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {campaign.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCampaignStatus(campaign.id, 'active')}
                              className="text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateCampaignStatus(campaign.id, 'rejected')}
                              className="text-red-600 hover:text-red-700"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {selectedCampaign && (
        <VerificationDocumentsDialog
          campaign={selectedCampaign}
          open={!!selectedCampaign}
          onOpenChange={(open) => !open && setSelectedCampaign(null)}
          onApprove={() => {
            updateCampaignStatus(selectedCampaign.id, 'active');
            setSelectedCampaign(null);
          }}
          onReject={() => {
            updateCampaignStatus(selectedCampaign.id, 'rejected');
            setSelectedCampaign(null);
          }}
        />
      )}
    </div>
  );
}
