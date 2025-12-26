import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, MapPin, Users } from "lucide-react";
import type { CommunityEvent } from "@/hooks/useCommunityHub";

interface CommunityEventsProps {
  events: CommunityEvent[];
  onBack: () => void;
}

const CommunityEvents = ({ events, onBack }: CommunityEventsProps) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Button variant="ghost" onClick={onBack}>
        ← {t('common.back')}
      </Button>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              <CardDescription>{t('community.organized_by')} {event.organizer}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{event.date} {t('community.at')} {event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{event.attendees} {t('community.attending')}</span>
                </div>
              </div>
              <Button className="w-full bg-gradient-primary">
                {t('community.join_event')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default CommunityEvents;
