import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Activity, Shield, MessageSquare, Flag, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ModerationLog {
  id: string;
  moderator_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const actionConfig: Record<string, { label: string; color: string; icon: any }> = {
  report_investigating: { label: 'Started Investigation', color: 'bg-blue-500', icon: Search },
  report_resolved: { label: 'Resolved Report', color: 'bg-green-500', icon: Shield },
  report_dismissed: { label: 'Dismissed Report', color: 'bg-gray-500', icon: AlertCircle },
  comment_approved: { label: 'Approved Comment', color: 'bg-green-500', icon: MessageSquare },
  comment_deleted: { label: 'Deleted Comment', color: 'bg-red-500', icon: MessageSquare },
  bulk_comments_approved: { label: 'Bulk Approved Comments', color: 'bg-green-500', icon: MessageSquare },
  bulk_comments_deleted: { label: 'Bulk Deleted Comments', color: 'bg-red-500', icon: MessageSquare },
};

export default function ActivityLog() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('moderation_logs')
        .select(`
          *,
          profiles!moderator_id(full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data as any || []);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionDisplay = (actionType: string) => {
    const config = actionConfig[actionType] || { 
      label: actionType.replace(/_/g, ' '), 
      color: 'bg-gray-500',
      icon: Activity 
    };
    return config;
  };

  const filteredLogs = logs.filter(log =>
    log.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground">Track all moderation actions</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="report_investigating">Started Investigation</SelectItem>
                <SelectItem value="report_resolved">Resolved Report</SelectItem>
                <SelectItem value="report_dismissed">Dismissed Report</SelectItem>
                <SelectItem value="comment_approved">Approved Comment</SelectItem>
                <SelectItem value="comment_deleted">Deleted Comment</SelectItem>
                <SelectItem value="bulk_comments_approved">Bulk Approved</SelectItem>
                <SelectItem value="bulk_comments_deleted">Bulk Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity logs found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const actionDisplay = getActionDisplay(log.action_type);
            const Icon = actionDisplay.icon;

            return (
              <Card key={log.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${actionDisplay.color} text-white shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {log.profiles.full_name}{' '}
                            <span className="font-normal text-muted-foreground">
                              {actionDisplay.label.toLowerCase()}
                            </span>
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">
                              {log.target_type}
                            </Badge>
                            {log.details?.count && (
                              <span className="text-sm text-muted-foreground">
                                {log.details.count} items
                              </span>
                            )}
                            {log.details?.notes && (
                              <span className="text-sm text-muted-foreground">
                                Note: {log.details.notes}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
