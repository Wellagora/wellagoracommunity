import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompletionItem {
  key: string;
  label: string;
  points: number;
  completed: boolean;
}

export const ProfileCompletionBar = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [items, setItems] = useState<CompletionItem[]>([]);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select(
            'first_name, last_name, avatar_url, bio, expert_title, location_city, expertise_areas'
          )
          .eq('id', user.id)
          .maybeSingle();

        if (!profile) return;

        const completionItems: CompletionItem[] = [
          {
            key: 'name',
            label: t('profile.completion.full_name'),
            points: 10,
            completed: !!(profile.first_name && profile.last_name),
          },
          {
            key: 'photo',
            label: t('profile.completion.profile_photo'),
            points: 10,
            completed: !!profile.avatar_url,
          },
          {
            key: 'bio',
            label: t('profile.completion.bio'),
            points: 10,
            completed: !!profile.bio,
          },
          {
            key: 'title',
            label: t('profile.completion.expert_title'),
            points: 10,
            completed: !!profile.expert_title,
          },
          {
            key: 'location',
            label: t('profile.completion.location'),
            points: 5,
            completed: !!profile.location_city,
          },
          {
            key: 'expertise',
            label: t('profile.completion.expertise_areas'),
            points: 5,
            completed: !!(profile.expertise_areas && (profile.expertise_areas as any).length > 0),
          },
        ];

        setItems(completionItems);

        const totalPoints = completionItems.reduce((acc, item) => acc + item.points, 0);
        const earnedPoints = completionItems
          .filter(item => item.completed)
          .reduce((acc, item) => acc + item.points, 0);

        setCompletion(Math.round((earnedPoints / totalPoints) * 100));
      } catch (error) {
        console.error('Error loading profile completion:', error);
      }
    };

    loadProgress();
  }, [user, t]);

  if (!items.length || completion === 100) return null;

  const completedCount = items.filter(item => item.completed).length;

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {t('profile.completion.title')} {completion}%
          </h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{items.length}
          </span>
        </div>

        <Progress value={completion} className="h-2" />

        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2 text-xs"
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2"
            >
              {item.completed ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                {item.label}
              </span>
              <span className="text-muted-foreground ml-auto">+{item.points}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Card>
  );
};
