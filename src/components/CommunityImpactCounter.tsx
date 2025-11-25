import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, Handshake, Calendar, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

interface CounterProps {
  end: number;
  duration?: number;
}

const AnimatedCounter = ({ end, duration = 2000 }: CounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

export const CommunityImpactCounter = () => {
  const { t } = useLanguage();

  const metrics = [
    {
      icon: Users,
      label: t('impact_counter.active_members'),
      value: 2847,
      suffix: "",
      change: "+18%",
      color: "primary",
    },
    {
      icon: MessageSquare,
      label: t('impact_counter.shared_ideas'),
      value: 1256,
      suffix: "",
      change: "+24%",
      color: "success",
    },
    {
      icon: Handshake,
      label: t('impact_counter.collaborations'),
      value: 342,
      suffix: "",
      change: "+31%",
      color: "accent",
    },
    {
      icon: Calendar,
      label: t('impact_counter.events_held'),
      value: 127,
      suffix: "",
      change: "+15%",
      color: "warning",
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-4">
            <TrendingUp className="w-4 h-4 mr-1" />
            {t('impact_counter.badge')}
          </Badge>
          <h2 className="text-3xl font-bold mb-2">{t('impact_counter.title')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('impact_counter.subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-${metric.color}/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <metric.icon className={`w-6 h-6 text-${metric.color}`} />
                    </div>
                    <Badge className={`bg-${metric.color}/10 text-${metric.color} border-${metric.color}/20`}>
                      {metric.change}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold text-foreground">
                        <AnimatedCounter end={metric.value} />
                      </span>
                      {metric.suffix && (
                        <span className="text-sm text-muted-foreground">{metric.suffix}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  </div>
                </CardContent>
                
                <div className={`absolute inset-0 bg-${metric.color}/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
