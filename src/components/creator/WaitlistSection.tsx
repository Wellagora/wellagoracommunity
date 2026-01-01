import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface WaitlistItem {
  id: string;
  title: string;
  waitlist_count: number;
}

export const WaitlistSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [waitlistData, setWaitlistData] = useState<WaitlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWaitlist = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Get expert's contents
        const { data: contents } = await supabase
          .from('expert_contents')
          .select('id, title')
          .eq('creator_id', user.id);

        if (!contents || contents.length === 0) {
          setIsLoading(false);
          return;
        }

        // Get waitlist count for each content
        const results = await Promise.all(
          contents.map(async (c) => {
            const { count } = await supabase
              .from('content_waitlist')
              .select('*', { count: 'exact', head: true })
              .eq('content_id', c.id);

            return {
              id: c.id,
              title: c.title,
              waitlist_count: count || 0
            };
          })
        );

        // Only show contents with waitlist
        setWaitlistData(results.filter(r => r.waitlist_count > 0));
      } catch (error) {
        console.error('Error loading waitlist:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWaitlist();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (waitlistData.length === 0) return null;

  const totalWaiting = waitlistData.reduce((sum, item) => sum + item.waitlist_count, 0);

  return (
    <Card className="p-5 border-amber-500/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Users className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold">{t('waitlist.title')}</h3>
          <p className="text-xs text-muted-foreground">
            {t('waitlist.total_waiting').replace('{{count}}', String(totalWaiting))}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {waitlistData.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-background rounded-lg"
          >
            <span className="font-medium truncate flex-1 mr-2">{item.title}</span>
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 shrink-0">
              {item.waitlist_count} {t('waitlist.waiting')}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-600">
          {t('waitlist.find_sponsor_hint')}
        </p>
      </div>
    </Card>
  );
};
