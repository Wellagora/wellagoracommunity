import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Bell, Mail, BookOpen, Calendar, Users, CreditCard, 
  Building2, Newspaper, Megaphone, Moon 
} from 'lucide-react';

interface NotificationPrefs {
  push_enabled: boolean;
  email_enabled: boolean;
  program_notifications: boolean;
  event_reminders: boolean;
  community_updates: boolean;
  payment_notifications: boolean;
  sponsor_updates: boolean;
  weekly_digest: boolean;
  marketing_emails: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  quiet_hours_timezone: string;
  digest_frequency: string;
}

const defaultPrefs: NotificationPrefs = {
  push_enabled: true,
  email_enabled: true,
  program_notifications: true,
  event_reminders: true,
  community_updates: true,
  payment_notifications: true,
  sponsor_updates: true,
  weekly_digest: true,
  marketing_emails: false,
  quiet_hours_start: null,
  quiet_hours_end: null,
  quiet_hours_timezone: 'Europe/Budapest',
  digest_frequency: 'weekly',
};

export const NotificationPreferences = () => {
  const { t } = useLanguage();
  const { subscribeToPush } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs>(defaultPrefs);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({ ...defaultPrefs, ...data });
      }
    } catch {
      // Silent failure - use defaults
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: t('notifications.settings_saved'),
        description: t('notifications.settings_saved_description')
      });
    } catch {
      toast({
        title: t('common.error'),
        description: t('notifications.settings_save_error'),
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    await subscribeToPush();
    setPreferences(prev => ({ ...prev, push_enabled: true }));
  };

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">{t('common.loading')}...</div>;
  }

  const categoryToggles = [
    {
      key: 'program_notifications' as keyof NotificationPrefs,
      icon: BookOpen,
      title: t('notifications.pref_programs'),
      description: t('notifications.pref_programs_desc')
    },
    {
      key: 'event_reminders' as keyof NotificationPrefs,
      icon: Calendar,
      title: t('notifications.pref_events'),
      description: t('notifications.pref_events_desc')
    },
    {
      key: 'community_updates' as keyof NotificationPrefs,
      icon: Users,
      title: t('notifications.pref_community'),
      description: t('notifications.pref_community_desc')
    },
    {
      key: 'payment_notifications' as keyof NotificationPrefs,
      icon: CreditCard,
      title: t('notifications.pref_payments'),
      description: t('notifications.pref_payments_desc')
    },
    {
      key: 'sponsor_updates' as keyof NotificationPrefs,
      icon: Building2,
      title: t('notifications.pref_sponsor'),
      description: t('notifications.pref_sponsor_desc')
    },
    {
      key: 'weekly_digest' as keyof NotificationPrefs,
      icon: Newspaper,
      title: t('notifications.pref_digest'),
      description: t('notifications.pref_digest_desc')
    },
    {
      key: 'marketing_emails' as keyof NotificationPrefs,
      icon: Megaphone,
      title: t('notifications.pref_marketing'),
      description: t('notifications.pref_marketing_desc')
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('notifications.preferences')}
        </CardTitle>
        <CardDescription>
          {t('notifications.preferences_description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Master Switches */}
        <div>
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">
            {t('notifications.channels_section')}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="push_enabled" className="font-medium">
                    {t('notifications.push_notifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('notifications.push_notifications_desc')}
                  </p>
                </div>
              </div>
              {!preferences.push_enabled ? (
                <Button size="sm" onClick={handleEnablePush}>
                  {t('notifications.enable_push')}
                </Button>
              ) : (
                <Switch
                  id="push_enabled"
                  checked={preferences.push_enabled}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, push_enabled: checked }))
                  }
                />
              )}
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <Label htmlFor="email_enabled" className="font-medium">
                    {t('notifications.email_notifications')}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {t('notifications.email_notifications_desc')}
                  </p>
                </div>
              </div>
              <Switch
                id="email_enabled"
                checked={preferences.email_enabled}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, email_enabled: checked }))
                }
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Category Toggles */}
        <div>
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">
            {t('notifications.what_to_receive')}
          </h3>
          <div className="space-y-1">
            {categoryToggles.map(({ key, icon: Icon, title, description }) => (
              <div key={key} className="flex items-center justify-between py-2.5 px-1">
                <div className="flex items-start gap-3 flex-1">
                  <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <Label htmlFor={key} className="cursor-pointer text-sm">
                      {title}
                    </Label>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={!!preferences[key]}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quiet Hours */}
        <div>
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Moon className="h-4 w-4" />
            {t('notifications.quiet_hours')}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">
            {t('notifications.quiet_hours_desc')}
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="time"
              value={preferences.quiet_hours_start || '22:00'}
              onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
              className="w-28"
            />
            <span className="text-sm text-muted-foreground">—</span>
            <Input
              type="time"
              value={preferences.quiet_hours_end || '08:00'}
              onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
              className="w-28"
            />
          </div>
        </div>

        <Button
          onClick={savePreferences}
          disabled={saving}
          className="w-full"
        >
          {saving ? t('common.saving') : t('common.save_changes')}
        </Button>
      </CardContent>
    </Card>
  );
};