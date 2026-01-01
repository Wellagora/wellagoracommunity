import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageCircle, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface Service {
  id: string;
  title: string;
  description: string | null;
  service_type: string;
  price_huf: number;
  duration_minutes: number | null;
}

interface ExpertServicesSectionProps {
  expertId: string;
}

export const ExpertServicesSection = ({ expertId }: ExpertServicesSectionProps) => {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      const { data } = await supabase
        .from('expert_services')
        .select('*')
        .eq('expert_id', expertId)
        .eq('is_active', true);

      setServices(data || []);
      setIsLoading(false);
    };

    loadServices();
  }, [expertId]);

  const handleRequest = (service: Service) => {
    toast.info(t('services.request_sent'));
    // In future: open contact modal or send message
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <Card className="p-5">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        {t('services.title')}
      </h3>
      
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{service.title}</span>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {service.price_huf.toLocaleString()} Ft
              </Badge>
            </div>
            
            {service.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {service.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              {service.duration_minutes && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.duration_minutes} perc
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRequest(service)}
                className="ml-auto"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {t('services.request')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
