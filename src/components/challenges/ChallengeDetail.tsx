import { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useProgramActions } from "@/hooks/useProgramActions";
import { supabase } from "@/integrations/supabase/client";
import ChallengeCelebrationModal from "./ChallengeCelebrationModal";
import InviteFriendsModal from "./InviteFriendsModal";
import ChallengeSponsorshipModal from "./ChallengeSponsorshipModal";
import ChallengeHeader from "./detail/ChallengeHeader";
import ChallengeProgress from "./detail/ChallengeProgress";
import ChallengeSteps from "./detail/ChallengeSteps";
import ChallengeTeamSection from "./detail/ChallengeTeamSection";
import ChallengeActions from "./detail/ChallengeActions";
import ChallengeSponsorInfo from "./detail/ChallengeSponsorInfo";
import ChallengeSuccessBanner from "./detail/ChallengeSuccessBanner";
import ChallengeTips from "./detail/ChallengeTips";
import ChallengeParticipants from "./detail/ChallengeParticipants";

interface Challenge {
  id: string;
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  category: "energy" | "transport" | "food" | "waste" | "community" | "innovation" | "water" | "biodiversity" | "circular-economy" | "green-finance";
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  durationKey: string;
  pointsReward: number;
  participants: number;
  completionRate: number;
  sponsor?: {
    name: string;
    logo: string;
    sponsorUserId?: string;
    organizationId?: string;
  };
  stepsKeys: string[];
  tipsKeys: string[];
  participants_preview: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
}

interface ChallengeDetailProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => void;
  onComplete?: (challengeId: string) => void;
  onStepComplete?: (stepIndex: number, completedSteps: number[]) => void;
  userProgress?: {
    isParticipating: boolean;
    isCompleted: boolean;
    progress: number;
    completedSteps: number[];
  };
}

const ChallengeDetail = ({ challenge, onJoin, onComplete, onStepComplete, userProgress }: ChallengeDetailProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSponsorModal, setShowSponsorModal] = useState(false);
  const [isCompletingStep, setIsCompletingStep] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  
  const { isOrganization, getButtonType } = useProgramActions(challenge.id);
  const buttonType = getButtonType();

  const handleJoinChallenge = () => {
    onJoin?.(challenge.id);
    toast({
      title: t('challenges.join_success'),
      description: t('challenges.join_success_desc'),
    });
  };

  const handleCompleteStep = async (stepIndex: number) => {
    if (!user || isCompletingStep) return;
    
    setIsCompletingStep(true);
    
    try {
      const currentCompletedSteps = userProgress?.completedSteps || [];
      if (currentCompletedSteps.includes(stepIndex)) {
        setIsCompletingStep(false);
        return;
      }
      
      const newCompletedSteps = [...currentCompletedSteps, stepIndex].sort((a, b) => a - b);
      const totalSteps = challenge.stepsKeys.length;
      const newProgress = Math.round((newCompletedSteps.length / totalSteps) * 100);
      const allStepsCompleted = newCompletedSteps.length === totalSteps;
      
      const { data: existingCompletion } = await supabase
        .from('challenge_completions')
        .select('id, evidence_data')
        .eq('challenge_id', challenge.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existingCompletion) {
        const { error: updateError } = await supabase
          .from('challenge_completions')
          .update({
            evidence_data: {
              ...(existingCompletion.evidence_data as object || {}),
              completed_steps: newCompletedSteps,
              progress: newProgress,
              last_step_completed_at: new Date().toISOString()
            },
            validation_status: allStepsCompleted ? 'approved' : 'pending',
            points_earned: allStepsCompleted ? challenge.pointsReward : 0
          })
          .eq('id', existingCompletion.id);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('challenge_completions')
          .insert({
            challenge_id: challenge.id,
            user_id: user.id,
            organization_id: profile?.organization_id || null,
            completion_type: 'manual',
            validation_status: allStepsCompleted ? 'approved' : 'pending',
            points_earned: allStepsCompleted ? challenge.pointsReward : 0,
            impact_data: {
              category: challenge.category,
              difficulty: challenge.difficulty
            },
            evidence_data: {
              completed_steps: newCompletedSteps,
              progress: newProgress,
              started_at: new Date().toISOString(),
              last_step_completed_at: new Date().toISOString()
            }
          });
          
        if (insertError) throw insertError;
      }
      
      onStepComplete?.(stepIndex, newCompletedSteps);
      
      if (allStepsCompleted) {
        toast({
          title: t('challenges.challenge_completed'),
          description: `${t('challenges.earned_points')}: ${challenge.pointsReward}`,
        });
        handleCompleteChallenge();
      } else {
        toast({
          title: t('challenges.step_completed'),
          description: `${t('challenges.step')} ${stepIndex + 1} ${t('challenges.of')} ${totalSteps} ${t('challenges.completed')}`,
        });
      }
    } catch (error) {
      toast({
        title: t('challenges.error'),
        description: t('challenges.step_completion_error'),
        variant: 'destructive'
      });
    } finally {
      setIsCompletingStep(false);
    }
  };

  const handleCompleteChallenge = () => {
    onComplete?.(challenge.id);
    setShowCelebration(true);
  };

  const handleShare = async () => {
    const shareText = userProgress?.isParticipating 
      ? `${t('challenges.im_taking_challenge')} "${t(challenge.titleKey)}"! 🌱\n\n💪 ${userProgress.progress}% ${t('challenges.completed')}`
      : `${t('challenges.check_out_challenge')} "${t(challenge.titleKey)}"! 🌱\n\n🏆 ${challenge.pointsReward} ${t('challenges.points')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: t(challenge.titleKey),
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(shareText + '\n' + window.location.href);
      toast({
        title: t('challenges.link_copied'),
        description: t('challenges.link_copied_desc'),
      });
    }
  };

  return (
    <>
      <ChallengeCelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        challengeTitle={t(challenge.titleKey)}
        pointsEarned={challenge.pointsReward}
        onInviteFriends={() => setShowInviteModal(true)}
      />
      
      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        challengeTitle={t(challenge.titleKey)}
        challengeId={challenge.id}
      />

      <ChallengeSponsorshipModal
        open={showSponsorModal}
        onOpenChange={setShowSponsorModal}
        challengeId={challenge.id}
        challengeTitle={t(challenge.titleKey)}
        region="Hungary"
      />
      
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <ChallengeSuccessBanner
          participants={challenge.participants}
          completionRate={challenge.completionRate}
          isParticipating={userProgress?.isParticipating || false}
        />
        
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <ChallengeHeader
              titleKey={challenge.titleKey}
              descriptionKey={challenge.descriptionKey}
              durationKey={challenge.durationKey}
              category={challenge.category}
              pointsReward={challenge.pointsReward}
              participants={challenge.participants}
              completionRate={challenge.completionRate}
              onShare={handleShare}
            />
            
            <ChallengeProgress
              progress={userProgress?.progress || 0}
              isParticipating={userProgress?.isParticipating || false}
              isCompleted={userProgress?.isCompleted || false}
            />
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">{t('challenges.details')}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(challenge.longDescriptionKey)}
              </p>
            </div>
            
            <ChallengeTeamSection
              isParticipating={userProgress?.isParticipating || false}
              isCompleted={userProgress?.isCompleted || false}
              onInviteFriends={() => setShowInviteModal(true)}
            />

            <ChallengeSteps
              stepsKeys={challenge.stepsKeys}
              completedSteps={userProgress?.completedSteps || []}
              isParticipating={userProgress?.isParticipating || false}
              isCompletingStep={isCompletingStep}
              onCompleteStep={handleCompleteStep}
            />
            
            <ChallengeTips tipsKeys={challenge.tipsKeys} />
            
            <ChallengeSponsorInfo sponsor={challenge.sponsor} />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <ChallengeActions
              challengeId={challenge.id}
              pointsReward={challenge.pointsReward}
              stepsCount={challenge.stepsKeys.length}
              isOrganization={isOrganization}
              buttonType={buttonType}
              userProgress={userProgress}
              onJoin={handleJoinChallenge}
              onComplete={handleCompleteChallenge}
              onShare={handleShare}
              onSponsor={() => setShowSponsorModal(true)}
            />
            
            <ChallengeParticipants
              participants={challenge.participants}
              participantsPreview={challenge.participants_preview}
            />
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ChallengeDetail;
