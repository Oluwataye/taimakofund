import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type CampaignUpdate = Database['public']['Tables']['campaign_updates']['Row'] & {
  profiles: {
    full_name: string;
  } | null;
};

interface CampaignUpdatesListProps {
  campaignId: string;
}

export function CampaignUpdatesList({ campaignId }: CampaignUpdatesListProps) {
  const [updates, setUpdates] = useState<CampaignUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpdates();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('campaign-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'campaign_updates',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          fetchUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_updates')
        .select('*, profiles(full_name)')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No updates yet</p>
          <p className="text-sm text-muted-foreground">Check back later for campaign progress updates</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campaign Updates</h2>
      <div className="space-y-4">
        {updates.map((update, index) => (
          <Card key={update.id} className="relative">
            {index !== updates.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border" />
            )}
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-10 w-10 border-2 border-background relative z-10">
                  <AvatarFallback>
                    {update.profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{update.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>{update.profiles?.full_name || 'Campaign Creator'}</span>
                    <span>•</span>
                    <span>{new Date(update.created_at).toLocaleDateString('en-NG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-[72px] space-y-4">
              {update.image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={update.image_url}
                    alt={update.title}
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}
              <p className="text-foreground whitespace-pre-wrap">{update.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
