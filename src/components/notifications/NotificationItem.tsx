import { Notification, useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Trophy, Users, Bell, Shield } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
}

const typeIcons = {
  milestone: Trophy,
  community: Users,
  reminder: Bell,
  admin: Shield
};

const typeColors = {
  milestone: 'text-yellow-500',
  community: 'text-blue-500',
  reminder: 'text-orange-500',
  admin: 'text-purple-500'
};

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();
  const Icon = typeIcons[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 hover:bg-accent/50 cursor-pointer transition-colors",
        !notification.read && "bg-accent/20"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("flex-shrink-0 mt-1", typeColors[notification.type])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium leading-tight",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-xs text-muted-foreground mt-2 block">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};