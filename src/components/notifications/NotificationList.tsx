import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Bell } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const NotificationList = () => {
  const { notifications, loading, markAllAsRead } = useNotifications();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('common.loading')}...
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          {t('notifications.title')}
        </h3>
        {notifications.some(n => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            {t('notifications.mark_all_read')}
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('notifications.no_notifications')}</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};