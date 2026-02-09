import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Bell, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

export const NotificationList = () => {
  const { notifications, loading, markAllAsRead, unreadCount } = useNotifications();
  const { t } = useLanguage();

  const recentNotifications = notifications.slice(0, 5);

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('common.loading')}...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          {t('notifications.title')}
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs h-7 px-2"
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            {t('notifications.mark_all_read')}
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="max-h-[360px]">
        {recentNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">{t('notifications.empty')}</p>
            <p className="text-xs mt-1">{t('notifications.empty_desc')}</p>
          </div>
        ) : (
          <div className="divide-y">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact
              />
            ))}
          </div>
        )}
      </ScrollArea>
      {notifications.length > 0 && (
        <>
          <Separator />
          <Link
            to="/ertesitesek"
            className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-primary hover:bg-accent/50 transition-colors"
          >
            {t('notifications.see_all')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      )}
    </div>
  );
};