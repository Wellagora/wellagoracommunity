import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActiveStats {
  learningToday: number;
  activePrograms: number;
  liveNow: number;
}

const ActiveNowStats = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<ActiveStats>({
    learningToday: 0,
    activePrograms: 0,
    liveNow: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActiveStats = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Count vouchers claimed today (people learning today)
        const { count: learningCount } = await supabase
          .from('vouchers')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());

        // Count active programs with published content
        const { count: programCount } = await supabase
          .from('expert_contents')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // Count active vouchers (simulating "live now")
        const { count: activeCount } = await supabase
          .from('vouchers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Add some realistic baseline numbers for demo
        const baseLearning = 12;
        const baseActive = 5;

        setStats({
          learningToday: (learningCount || 0) + baseLearning,
          activePrograms: programCount || 0,
          liveNow: Math.min((activeCount || 0) + baseActive, 28)
        });
      } catch (error) {
        console.error('Error fetching active stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveStats();

    // Refresh every minute
    const interval = setInterval(fetchActiveStats, 60000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      icon: Users,
      value: stats.learningToday,
      label: language === 'hu' ? 'tag tanul ma' : 'members learning today',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      icon: BookOpen,
      value: stats.activePrograms,
      label: language === 'hu' ? 'elérhető program' : 'available programs',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      icon: Zap,
      value: stats.liveNow,
      label: language === 'hu' ? 'aktív voucher' : 'active vouchers',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {statItems.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className={`bg-white/80 backdrop-blur-xl border-[0.5px] ${item.borderColor} rounded-xl shadow-sm overflow-hidden`}>
            <CardContent className="p-3 text-center">
              <div className={`w-10 h-10 mx-auto rounded-xl ${item.bgColor} flex items-center justify-center mb-2`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-black/10 rounded w-12 mx-auto mb-1" />
                  <div className="h-3 bg-black/5 rounded w-16 mx-auto" />
                </div>
              ) : (
                <>
                  <motion.p 
                    className="text-2xl font-bold text-black"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {item.value}
                  </motion.p>
                  <p className="text-xs text-black/50 leading-tight">
                    {item.label}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ActiveNowStats;
