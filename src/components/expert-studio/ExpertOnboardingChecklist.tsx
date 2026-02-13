import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, User, BookOpen, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ChecklistStep {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  action: () => void;
  actionLabel: string;
}

export function ExpertOnboardingChecklist() {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const programsQuery = useQuery({
    queryKey: ['expertOnboardingPrograms', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('expert_contents')
        .select('id')
        .eq('creator_id', user.id)
        .limit(1);
      return data || [];
    },
    enabled: !!user,
  });

  const hasProfile = !!(profile?.bio && profile?.first_name && profile?.last_name);
  const hasProgram = (programsQuery.data?.length ?? 0) > 0;
  const hasStripe = !!(profile as any)?.stripe_onboarding_complete;

  const steps: ChecklistStep[] = [
    {
      id: 'profile',
      label: t('expert.onboarding.step_profile') || 'Profil kitöltése',
      description: t('expert.onboarding.step_profile_desc') || 'Add meg a neved, bio-d és szakterületed',
      completed: hasProfile,
      action: () => navigate('/profile'),
      actionLabel: t('expert.onboarding.edit_profile') || 'Profil szerkesztése',
    },
    {
      id: 'program',
      label: t('expert.onboarding.step_program') || 'Első program létrehozása',
      description: t('expert.onboarding.step_program_desc') || 'Hozd létre az első programod 4 lépésben',
      completed: hasProgram,
      action: () => navigate('/program/create'),
      actionLabel: t('expert.onboarding.create_program') || 'Program létrehozása',
    },
    {
      id: 'stripe',
      label: t('expert.onboarding.step_stripe') || 'Stripe fiók csatlakoztatása',
      description: t('expert.onboarding.step_stripe_desc') || 'Kifizetések fogadásához szükséges',
      completed: hasStripe,
      action: async () => {
        try {
          const { data, error } = await supabase.functions.invoke('create-connect-account', {
            body: { returnUrl: `${window.location.origin}/expert-studio` }
          });
          if (data?.url) window.location.href = data.url;
        } catch (e) {
          console.error('Stripe connect error:', e);
        }
      },
      actionLabel: t('expert.onboarding.connect_stripe') || 'Stripe csatlakoztatás',
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  // Don't show if all steps completed
  if (completedCount === steps.length) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-background">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            {t('expert.onboarding.title') || 'Kezdj hozzá!'}
          </CardTitle>
          <div className="flex items-center gap-3 mt-2">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/{steps.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                step.completed ? 'bg-emerald-50/50' : 'bg-muted/30'
              }`}
            >
              {step.completed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.completed ? 'text-emerald-700 line-through' : ''}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              </div>
              {!step.completed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 text-xs"
                  onClick={step.action}
                >
                  {step.actionLabel}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
