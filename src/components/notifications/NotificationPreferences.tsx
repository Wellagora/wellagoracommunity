import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bell, Trophy, Users, Calendar, Shield } from 'lucide-react';

interface NotificationPrefs {
  push_enabled: boolean;
  milestones_enabled: boolean;
  community_enabled: boolean;
  reminders_enabled: boolean;
  admin_enabled: boolean;
}

export const NotificationPreferences = () => {
  const { t } = useLanguage();
  const { subscribeToPush } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    push_enabled: true,
    milestones_enabled: true,
    community_enabled: true,
    reminders_enabled: true,
    admin_enabled: true
  });

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

      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        throw error;
      }

      if (data) {
        setPreferences(data);
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
          ...preferences
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
    return <div>{t('common.loading')}...</div>;
  }

  const notificationTypes = [
    {
      key: 'milestones_enabled' as keyof NotificationPrefs,
      icon: Trophy,
      title: t('notifications.types.milestones'),
      description: t('notifications.types.milestones_desc')
    },
    {
      key: 'community_enabled' as keyof NotificationPrefs,
      icon: Users,
      title: t('notifications.types.community'),
      description: t('notifications.types.community_desc')
    },
    {
      key: 'reminders_enabled' as keyof NotificationPrefs,
      icon: Calendar,
      title: t('notifications.types.reminders'),
      description: t('notifications.types.reminders_desc')
    },
    {
      key: 'admin_enabled' as keyof NotificationPrefs,
      icon: Shield,
      title: t('notifications.types.admin'),
      description: t('notifications.types.admin_desc')
    }
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
        {/* Push Notifications Master Switch */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-accent/30">
          <div>
            <Label htmlFor="push_enabled" className="text-base font-semibold">
              {t('notifications.push_notifications')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('notifications.push_notifications_desc')}
            </p>
          </div>
          {!preferences.push_enabled ? (
            <Button onClick={handleEnablePush}>
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

        {/* Notification Type Preferences */}
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">
            {t('notifications.notification_types')}
          </h3>
          {notificationTypes.map(({ key, icon: Icon, title, description }) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="flex items-start gap-3 flex-1">
                <Icon className="h-5 w-5 mt-0.5 text-primary" />
                <div>
                  <Label htmlFor={key} className="cursor-pointer">
                    {title}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                id={key}
                checked={preferences[key]}
                onCheckedChange={(checked) =>
                  setPreferences(prev => ({ ...prev, [key]: checked }))
                }
                disabled={!preferences.push_enabled}
              />
            </div>
          ))}
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