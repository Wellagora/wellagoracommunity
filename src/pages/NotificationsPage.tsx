import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications, Notification, NotificationCategory } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Bell, CheckCheck, Trash2, ArrowLeft, Archive,
  BookOpen, CreditCard, Users, Settings, Building2,
  ExternalLink
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from "date-fns";
import { hu, enUS, de } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  all: Bell,
  program: BookOpen,
  payment: CreditCard,
  community: Users,
  system: Settings,
  sponsor: Building2,
};

const categoryColors: Record<string, string> = {
  program: 'text-emerald-500 bg-emerald-50',
  payment: 'text-blue-500 bg-blue-50',
  community: 'text-violet-500 bg-violet-50',
  system: 'text-slate-500 bg-slate-50',
  sponsor: 'text-amber-500 bg-amber-50',
  general: 'text-gray-500 bg-gray-50',
};

type FilterCategory = 'all' | NotificationCategory;

interface DateGroup {
  label: string;
  notifications: Notification[];
}

const NotificationsPage = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { 
    notifications, unreadCount, loading, 
    markAsRead, markAllAsRead, deleteNotification, archiveNotification 
  } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const dateLocale = language === "hu" ? hu : language === "de" ? de : enUS;

  const filterTabs: { key: FilterCategory; label: string; icon: any }[] = [
    { key: 'all', label: t('notifications.filter_all'), icon: Bell },
    { key: 'program', label: t('notifications.filter_programs'), icon: BookOpen },
    { key: 'payment', label: t('notifications.filter_payments'), icon: CreditCard },
    { key: 'community', label: t('notifications.filter_community'), icon: Users },
    { key: 'system', label: t('notifications.filter_system'), icon: Settings },
  ];

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => (n.category || 'general') === activeFilter);
  }, [notifications, activeFilter]);

  const dateGroups = useMemo((): DateGroup[] => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    filteredNotifications.forEach(n => {
      const date = new Date(n.created_at);
      if (isToday(date)) today.push(n);
      else if (isYesterday(date)) yesterday.push(n);
      else if (isThisWeek(date)) thisWeek.push(n);
      else older.push(n);
    });

    const groups: DateGroup[] = [];
    if (today.length > 0) groups.push({ label: t('notifications.date_today'), notifications: today });
    if (yesterday.length > 0) groups.push({ label: t('notifications.date_yesterday'), notifications: yesterday });
    if (thisWeek.length > 0) groups.push({ label: t('notifications.date_this_week'), notifications: thisWeek });
    if (older.length > 0) groups.push({ label: t('notifications.date_older'), notifications: older });
    return groups;
  }, [filteredNotifications, t]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    toast({
      title: t("notifications.all_marked_read"),
      description: t("notifications.all_marked_read_desc"),
    });
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="md:hidden">
              <Button variant="ghost" size="icon" className="min-w-[44px] min-h-[44px]">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-foreground" />
              <h1 className="text-xl font-semibold">{t("notifications.title")}</h1>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-primary min-h-[44px]"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              {t("notifications.mark_all_read")}
            </Button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {filterTabs.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t("notifications.empty")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("notifications.empty_desc")}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {dateGroups.map(group => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {group.notifications.map((notification, index) => {
                    const category = notification.category || 'general';
                    const Icon = categoryIcons[category] || Bell;
                    const colorClass = categoryColors[category] || categoryColors.general;

                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <Card
                          className={cn(
                            "transition-all duration-200 cursor-pointer hover:shadow-sm",
                            !notification.read 
                              ? "bg-primary/5 border-primary/20" 
                              : "bg-card border-border/50"
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {notification.icon ? (
                                <span className="text-xl flex-shrink-0 mt-0.5">{notification.icon}</span>
                              ) : (
                                <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center", colorClass)}>
                                  <Icon className="w-5 h-5" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className={cn(
                                    "text-sm line-clamp-1",
                                    !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    {!notification.read && (
                                      <div className="w-2 h-2 rounded-full bg-primary" />
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        archiveNotification(notification.id);
                                      }}
                                      className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                      title={t('notifications.archive')}
                                    >
                                      <Archive className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteNotification(notification.id);
                                      }}
                                      className="p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: dateLocale })}
                                  </span>
                                  {notification.action_url && notification.action_label && (
                                    <span className="text-xs font-medium text-primary flex items-center gap-1">
                                      {notification.action_label}
                                      <ExternalLink className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
