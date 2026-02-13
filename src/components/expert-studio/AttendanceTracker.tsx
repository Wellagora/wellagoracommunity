import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Users, ClipboardCheck } from 'lucide-react';

interface AttendanceTrackerProps {
  programId: string;
  programTitle: string;
}

interface Participant {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  checked_in: boolean;
}

export function AttendanceTracker({ programId, programTitle }: AttendanceTrackerProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const participantsQuery = useQuery({
    queryKey: ['attendance', programId],
    queryFn: async () => {
      // Get all purchasers/voucher holders for this program
      const [purchasesRes, vouchersRes, attendanceRes] = await Promise.all([
        supabase
          .from('purchases')
          .select('user_id, profiles:user_id(first_name, last_name, avatar_url)')
          .eq('content_id', programId)
          .eq('status', 'completed'),
        supabase
          .from('vouchers')
          .select('user_id, profiles:user_id(first_name, last_name, avatar_url)')
          .eq('content_id', programId)
          .eq('status', 'active'),
        supabase
          .from('attendance')
          .select('user_id')
          .eq('program_id', programId),
      ]);

      const checkedInIds = new Set((attendanceRes.data || []).map((a: any) => a.user_id));
      const participantMap = new Map<string, Participant>();

      for (const row of [...(purchasesRes.data || []), ...(vouchersRes.data || [])]) {
        const p = row as any;
        if (!participantMap.has(p.user_id)) {
          participantMap.set(p.user_id, {
            user_id: p.user_id,
            first_name: p.profiles?.first_name || null,
            last_name: p.profiles?.last_name || null,
            avatar_url: p.profiles?.avatar_url || null,
            checked_in: checkedInIds.has(p.user_id),
          });
        }
      }

      return Array.from(participantMap.values());
    },
    enabled: !!programId,
  });

  const checkInMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('attendance').upsert({
        program_id: programId,
        user_id: userId,
        checked_in_by: user?.id,
        checked_in_at: new Date().toISOString(),
      }, { onConflict: 'program_id,user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', programId] });
      toast.success(t('attendance.checked_in') || 'Jelenlét rögzítve');
    },
  });

  const participants = participantsQuery.data || [];
  const checkedIn = participants.filter(p => p.checked_in).length;
  const total = participants.length;
  const percent = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  const getInitials = (first: string | null, last: string | null) =>
    ((first?.charAt(0) || '') + (last?.charAt(0) || '')).toUpperCase() || '?';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4 text-emerald-600" />
          {programTitle}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={percent} className="h-2 flex-1" />
          <span className="text-sm font-medium text-muted-foreground">
            {checkedIn}/{total}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {participants.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('attendance.no_participants') || 'Még nincs résztvevő'}
          </p>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={p.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(p.first_name, p.last_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-sm font-medium truncate">
                  {`${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User'}
                </span>
                {p.checked_in ? (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {t('attendance.present') || 'Jelen'}
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => checkInMutation.mutate(p.user_id)}
                    disabled={checkInMutation.isPending}
                  >
                    <Circle className="w-3 h-3" />
                    {t('attendance.check_in') || 'Bejelentkeztetés'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
