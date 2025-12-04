import { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Search, Activity, Shield, MessageSquare, AlertCircle, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow, format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

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

const actionConfig: Record<string, { label: string; color: string; icon: any; chartColor: string }> = {
  report_investigating: { label: 'Started Investigation', color: 'bg-blue-500', icon: Search, chartColor: '#3b82f6' },
  report_resolved: { label: 'Resolved Report', color: 'bg-green-500', icon: Shield, chartColor: '#22c55e' },
  report_dismissed: { label: 'Dismissed Report', color: 'bg-gray-500', icon: AlertCircle, chartColor: '#6b7280' },
  comment_approved: { label: 'Approved Comment', color: 'bg-green-500', icon: MessageSquare, chartColor: '#10b981' },
  comment_deleted: { label: 'Deleted Comment', color: 'bg-red-500', icon: MessageSquare, chartColor: '#ef4444' },
  bulk_comments_approved: { label: 'Bulk Approved', color: 'bg-green-500', icon: MessageSquare, chartColor: '#059669' },
  bulk_comments_deleted: { label: 'Bulk Deleted', color: 'bg-red-500', icon: MessageSquare, chartColor: '#dc2626' },
};

const CHART_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#6b7280'];

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
        .select(`*, profiles!moderator_id(full_name)`)
        .order('created_at', { ascending: false })
        .limit(500);

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setLogs(data as any || []);
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      toast({ title: 'Error', description: 'Failed to load activity logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const last7Days = subDays(today, 7);
    const last30Days = subDays(today, 30);

    const todayLogs = logs.filter(l => new Date(l.created_at) >= today);
    const weekLogs = logs.filter(l => new Date(l.created_at) >= last7Days);

    const uniqueModerators = new Set(logs.map(l => l.moderator_id)).size;

    return {
      total: logs.length,
      today: todayLogs.length,
      thisWeek: weekLogs.length,
      activeModerators: uniqueModerators,
    };
  }, [logs]);

  // Daily activity chart data (last 7 days)
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return days.map(day => {
      const dayLogs = logs.filter(l => format(new Date(l.created_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
      return {
        date: format(day, 'EEE'),
        actions: dayLogs.length,
        reports: dayLogs.filter(l => l.action_type.startsWith('report_')).length,
        comments: dayLogs.filter(l => l.action_type.includes('comment')).length,
      };
    });
  }, [logs]);

  // Action type distribution
  const actionDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    logs.forEach(log => {
      distribution[log.action_type] = (distribution[log.action_type] || 0) + 1;
    });
    return Object.entries(distribution).map(([action, count]) => ({
      name: actionConfig[action]?.label || action,
      value: count,
      color: actionConfig[action]?.chartColor || '#6b7280',
    }));
  }, [logs]);

  // Top moderators
  const topModerators = useMemo(() => {
    const moderatorCounts: Record<string, { name: string; count: number }> = {};
    logs.forEach(log => {
      if (!moderatorCounts[log.moderator_id]) {
        moderatorCounts[log.moderator_id] = { name: log.profiles.full_name, count: 0 };
      }
      moderatorCounts[log.moderator_id].count++;
    });
    return Object.values(moderatorCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [logs]);

  const getActionDisplay = (actionType: string) => {
    return actionConfig[actionType] || { label: actionType.replace(/_/g, ' '), color: 'bg-gray-500', icon: Activity, chartColor: '#6b7280' };
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
        <p className="text-muted-foreground">Track all moderation actions and trends</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <CheckCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeModerators}</p>
                <p className="text-sm text-muted-foreground">Active Moderators</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daily Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                <Legend />
                <Bar dataKey="reports" name="Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" name="Comments" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Action Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={actionDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                  {actionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Moderators */}
      {topModerators.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Moderators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topModerators.map((mod, index) => (
                <div key={mod.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{mod.name}</p>
                  </div>
                  <Badge variant="secondary">{mod.count} actions</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search logs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
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
          {filteredLogs.slice(0, 50).map((log) => {
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
                            <span className="font-normal text-muted-foreground">{actionDisplay.label.toLowerCase()}</span>
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{log.target_type}</Badge>
                            {log.details?.count && <span className="text-sm text-muted-foreground">{log.details.count} items</span>}
                            {log.details?.notes && <span className="text-sm text-muted-foreground">Note: {log.details.notes}</span>}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground shrink-0">{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
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
