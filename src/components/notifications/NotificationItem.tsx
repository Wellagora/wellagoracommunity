import { Notification, NotificationCategory, useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { hu, enUS, de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { 
  BookOpen, CreditCard, Users, Settings, Building2, Bell,
  Trophy, Calendar, MessageCircle, Star, Gift, AlertTriangle
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
}

const categoryIcons: Record<string, any> = {
  program: BookOpen,
  payment: CreditCard,
  community: Users,
  system: Settings,
  sponsor: Building2,
  general: Bell,
};

const categoryColors: Record<string, string> = {
  program: 'text-emerald-500 bg-emerald-50',
  payment: 'text-blue-500 bg-blue-50',
  community: 'text-violet-500 bg-violet-50',
  system: 'text-slate-500 bg-slate-50',
  sponsor: 'text-amber-500 bg-amber-50',
  general: 'text-gray-500 bg-gray-50',
};

const priorityColors: Record<string, string> = {
  critical: 'border-l-red-500',
  high: 'border-l-orange-400',
  medium: 'border-l-transparent',
  low: 'border-l-transparent',
};

export const NotificationItem = ({ notification, compact = false }: NotificationItemProps) => {
  const { markAsRead } = useNotifications();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const category = notification.category || 'general';
  const Icon = categoryIcons[category] || Bell;
  const colorClass = categoryColors[category] || categoryColors.general;
  const priorityClass = priorityColors[notification.priority] || '';

  const dateLocale = language === 'hu' ? hu : language === 'de' ? de : enUS;

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
        "p-3 hover:bg-accent/50 cursor-pointer transition-colors border-l-2",
        !notification.read && "bg-primary/5",
        priorityClass
      )}
    >
      <div className="flex gap-3">
        {notification.icon ? (
          <span className="text-lg flex-shrink-0 mt-0.5">{notification.icon}</span>
        ) : (
          <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center", colorClass)}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm leading-tight line-clamp-1",
              !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
          <span className="text-[11px] text-muted-foreground/70 mt-1 block">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: dateLocale })}
          </span>
        </div>
      </div>
    </div>
  );
};