import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, X, Smartphone, Share } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PushPermissionPromptProps {
  onDismiss?: () => void;
  variant?: 'card' | 'banner' | 'inline';
}

export const PushPermissionPrompt = ({ onDismiss, variant = 'card' }: PushPermissionPromptProps) => {
  const { t } = useLanguage();
  const { 
    isSupported, permission, isSubscribed, 
    needsIOSInstall, loading, requestPermission 
  } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already subscribed, denied, or dismissed
  if (!isSupported || isSubscribed || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('push_prompt_dismissed', 'true');
    onDismiss?.();
  };

  const handleEnable = async () => {
    const success = await requestPermission();
    if (success) {
      toast({
        title: t('push.enabled_title'),
        description: t('push.enabled_desc'),
      });
      handleDismiss();
    } else if (permission === 'denied') {
      toast({
        title: t('push.denied_title'),
        description: t('push.denied_desc'),
        variant: 'destructive',
      });
    }
  };

  // Check if already dismissed this session
  if (sessionStorage.getItem('push_prompt_dismissed') === 'true') {
    return null;
  }

  // iOS Safari — needs PWA install first
  if (needsIOSInstall) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold mb-1">{t('push.ios_install_title')}</h4>
              <p className="text-xs text-muted-foreground mb-2">{t('push.ios_install_desc')}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <Share className="w-3.5 h-3.5" />
                  {t('push.ios_step_1')}
                </p>
                <p>{t('push.ios_step_2')}</p>
                <p>{t('push.ios_step_3')}</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standard push permission prompt
  if (variant === 'banner') {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
        <Bell className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-sm flex-1">{t('push.prompt_short')}</p>
        <Button size="sm" onClick={handleEnable} disabled={loading} className="flex-shrink-0">
          {t('push.enable_button')}
        </Button>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleEnable} 
        disabled={loading}
        className="gap-2"
      >
        <Bell className="w-4 h-4" />
        {t('push.enable_button')}
      </Button>
    );
  }

  // Default: card variant
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold mb-1">{t('push.prompt_title')}</h4>
            <p className="text-xs text-muted-foreground mb-3">{t('push.prompt_desc')}</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleEnable} disabled={loading}>
                {t('push.yes_notify')}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                {t('push.not_now')}
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
