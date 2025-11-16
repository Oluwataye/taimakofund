import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Clock, Users, Target } from "lucide-react";

interface DonationTrend {
  date: string;
  amount: number;
  count: number;
}

interface PeakHour {
  hour: string;
  donations: number;
}

interface CampaignPerformance {
  title: string;
  raised: number;
  goal: number;
  donors: number;
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [donationTrends, setDonationTrends] = useState<DonationTrend[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [campaignPerformance, setCampaignPerformance] = useState<CampaignPerformance[]>([]);
  const [retentionRate, setRetentionRate] = useState(0);
  const [totalMetrics, setTotalMetrics] = useState({
    totalDonations: 0,
    totalDonors: 0,
    avgDonation: 0,
    totalCampaigns: 0,
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch campaigns for this user
      const { data: campaigns } = await supabase
        .from("campaigns")
        .select("id, title, goal_amount, current_amount")
        .eq("creator_id", user?.id);

      if (!campaigns) return;

      const campaignIds = campaigns.map((c) => c.id);

      // Fetch donations for these campaigns
      const { data: donations } = await supabase
        .from("donations")
        .select("*")
        .in("campaign_id", campaignIds)
        .eq("payment_status", "successful")
        .order("created_at", { ascending: true });

      if (!donations) return;

      // Calculate donation trends (last 30 days)
      const trends: Record<string, { amount: number; count: number }> = {};
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      donations.forEach((donation) => {
        const date = new Date(donation.created_at!).toLocaleDateString();
        if (new Date(donation.created_at!) >= last30Days) {
          if (!trends[date]) {
            trends[date] = { amount: 0, count: 0 };
          }
          trends[date].amount += Number(donation.amount);
          trends[date].count += 1;
        }
      });

      const trendData = Object.entries(trends).map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count,
      }));
      setDonationTrends(trendData);

      // Calculate peak donation hours
      const hourCounts: Record<number, number> = {};
      donations.forEach((donation) => {
        const hour = new Date(donation.created_at!).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      });

      const hourData = Object.entries(hourCounts)
        .map(([hour, count]) => ({
          hour: `${hour}:00`,
          donations: count,
        }))
        .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
      setPeakHours(hourData);

      // Calculate campaign performance
      const performance = await Promise.all(
        campaigns.map(async (campaign) => {
          const { count } = await supabase
            .from("donations")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaign.id)
            .eq("payment_status", "successful");

          return {
            title: campaign.title,
            raised: Number(campaign.current_amount || 0),
            goal: Number(campaign.goal_amount),
            donors: count || 0,
          };
        })
      );
      setCampaignPerformance(performance);

      // Calculate donor retention rate
      const uniqueDonors = new Set(donations.map((d) => d.donor_id).filter(Boolean));
      const repeatDonors = donations.reduce((acc, donation) => {
        const donorDonations = donations.filter((d) => d.donor_id === donation.donor_id);
        if (donorDonations.length > 1 && donation.donor_id) {
          acc.add(donation.donor_id);
        }
        return acc;
      }, new Set());

      const retention = uniqueDonors.size > 0 ? (repeatDonors.size / uniqueDonors.size) * 100 : 0;
      setRetentionRate(retention);

      // Calculate total metrics
      const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount), 0);
      setTotalMetrics({
        totalDonations: totalAmount,
        totalDonors: uniqueDonors.size,
        avgDonation: uniqueDonors.size > 0 ? totalAmount / donations.length : 0,
        totalCampaigns: campaigns.length,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your campaigns and donations</p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalMetrics.totalDonations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{totalMetrics.totalCampaigns} campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMetrics.totalDonors}</div>
              <p className="text-xs text-muted-foreground">Unique supporters</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Donation</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{totalMetrics.avgDonation.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Per donation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retentionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Repeat donors</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Donation Trends</TabsTrigger>
            <TabsTrigger value="hours">Peak Hours</TabsTrigger>
            <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Donation Trends (Last 30 Days)</CardTitle>
                <CardDescription>Daily donation amounts and counts</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={donationTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" name="Amount (₦)" />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--secondary))" name="Count" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Peak Donation Hours</CardTitle>
                <CardDescription>When donors are most active</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="donations" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Progress towards goals across all campaigns</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="title" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="raised" fill="hsl(var(--primary))" name="Raised (₦)" />
                    <Bar dataKey="goal" fill="hsl(var(--secondary))" name="Goal (₦)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
