import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  HelpCircle,
  Camera,
  MessageCircle,
  Star,
  CheckCircle,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuestionWithDetails {
  id: string;
  question: string;
  created_at: string;
  content_id: string | null;
  user_id: string;
  user: { first_name: string; last_name: string; avatar_url: string | null } | null;
  content: { title: string } | null;
  hasAnswer: boolean;
}

interface CreationWithDetails {
  id: string;
  image_url: string;
  caption: string | null;
  rating: number | null;
  created_at: string;
  content_id: string | null;
  user_id: string;
  user: { first_name: string; last_name: string; avatar_url: string | null } | null;
  content: { title: string } | null;
}

interface CommunityInteractionsTabProps {
  onUnreadCountChange?: (count: number) => void;
}

const CommunityInteractionsTab = ({ onUnreadCountChange }: CommunityInteractionsTabProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'questions' | 'creations'>('questions');
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [creations, setCreations] = useState<CreationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInteractions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Get creator's content IDs
      const { data: myContents } = await supabase
        .from('expert_contents')
        .select('id, title')
        .eq('creator_id', user.id);

      if (myContents && myContents.length > 0) {
        const contentIds = myContents.map(c => c.id);

        // Load questions
        const { data: questionsData } = await supabase
          .from('community_questions')
          .select('id, question, created_at, content_id, user_id')
          .in('content_id', contentIds)
          .order('created_at', { ascending: false });

        if (questionsData) {
          const questionsWithDetails = await Promise.all(
            questionsData.map(async (q) => {
              const [userRes, contentRes, answersRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', q.user_id).single(),
                supabase.from('expert_contents').select('title').eq('id', q.content_id!).single(),
                supabase.from('community_answers').select('id').eq('question_id', q.id),
              ]);
              return {
                ...q,
                user: userRes.data,
                content: contentRes.data,
                hasAnswer: (answersRes.data?.length || 0) > 0,
              };
            })
          );
          setQuestions(questionsWithDetails);
          
          // Report unanswered count
          const unanswered = questionsWithDetails.filter(q => !q.hasAnswer).length;
          onUnreadCountChange?.(unanswered);
        }

        // Load creations
        const { data: creationsData } = await supabase
          .from('community_creations')
          .select('id, image_url, caption, rating, created_at, content_id, user_id')
          .in('content_id', contentIds)
          .order('created_at', { ascending: false });

        if (creationsData) {
          const creationsWithDetails = await Promise.all(
            creationsData.map(async (c) => {
              const [userRes, contentRes] = await Promise.all([
                supabase.from('profiles').select('first_name, last_name, avatar_url').eq('id', c.user_id).single(),
                supabase.from('expert_contents').select('title').eq('id', c.content_id!).single(),
              ]);
              return { ...c, user: userRes.data, content: contentRes.data };
            })
          );
          setCreations(creationsWithDetails);
        }
      } else {
        setQuestions([]);
        setCreations([]);
        onUnreadCountChange?.(0);
      }
    } catch (error) {
      console.error('Error loading interactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, onUnreadCountChange]);

  useEffect(() => {
    loadInteractions();
  }, [loadInteractions]);

  const unansweredCount = questions.filter(q => !q.hasAnswer).length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card
          className={`p-4 cursor-pointer transition-all ${
            activeSection === 'questions'
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-border hover:border-purple-500/50'
          }`}
          onClick={() => setActiveSection('questions')}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-sm text-muted-foreground">{t('expert_studio.questions_received')}</p>
            </div>
          </div>
          {unansweredCount > 0 && (
            <Badge className="mt-2 bg-red-500/20 text-red-400 border-red-500/30">
              {unansweredCount} {t('expert_studio.unanswered')}
            </Badge>
          )}
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all ${
            activeSection === 'creations'
              ? 'border-green-500 bg-green-500/10'
              : 'border-border hover:border-green-500/50'
          }`}
          onClick={() => setActiveSection('creations')}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Camera className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{creations.length}</p>
              <p className="text-sm text-muted-foreground">{t('expert_studio.creations_shared')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      {activeSection === 'questions' ? (
        <QuestionsSection questions={questions} onAnswered={loadInteractions} />
      ) : (
        <CreationsSection creations={creations} />
      )}
    </div>
  );
};

// Questions Section
interface QuestionsSectionProps {
  questions: QuestionWithDetails[];
  onAnswered: () => void;
}

const QuestionsSection = ({ questions, onAnswered }: QuestionsSectionProps) => {
  const { t } = useLanguage();

  if (questions.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">{t('expert_studio.no_questions_yet')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('expert_studio.no_questions_hint')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-purple-500" />
        {t('expert_studio.questions_from_community')}
      </h3>

      {questions.map((question) => (
        <QuestionCardWithAnswer
          key={question.id}
          question={question}
          onAnswered={onAnswered}
        />
      ))}
    </div>
  );
};

// Question Card with Answer functionality
interface QuestionCardWithAnswerProps {
  question: QuestionWithDetails;
  onAnswered: () => void;
}

const QuestionCardWithAnswer = ({ question, onAnswered }: QuestionCardWithAnswerProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [isAnswering, setIsAnswering] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_answers')
        .insert({
          question_id: question.id,
          expert_id: user.id,
          answer: answer.trim(),
        });

      if (error) throw error;

      toast.success(t('expert_studio.answer_sent'));
      setAnswer('');
      setIsAnswering(false);
      onAnswered();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error(t('expert_studio.answer_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${!question.hasAnswer ? 'border-purple-500/50' : ''}`}>
      <div className="p-5">
        {/* User info */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-purple-500/20 text-purple-500">
              {question.user?.first_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium">
                {question.user?.first_name} {question.user?.last_name}
              </p>
              {!question.hasAnswer && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {t('expert_studio.needs_answer')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('expert_studio.about_content')}: {question.content?.title}
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(question.created_at).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US')}
          </span>
        </div>

        {/* Question text */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p>{question.question}</p>
        </div>

        {/* Answer section */}
        {question.hasAnswer ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{t('expert_studio.already_answered')}</span>
          </div>
        ) : isAnswering ? (
          <div className="space-y-3">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t('expert_studio.write_your_answer')}
              className="min-h-[100px]"
              maxLength={1000}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answer.trim() || isSubmitting}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Send className="h-4 w-4 mr-2" />
                {t('expert_studio.send_answer')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAnswering(false);
                  setAnswer('');
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAnswering(true)}
            variant="outline"
            className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('expert_studio.answer_this')}
          </Button>
        )}
      </div>
    </Card>
  );
};

// Creations Section
interface CreationsSectionProps {
  creations: CreationWithDetails[];
}

const CreationsSection = ({ creations }: CreationsSectionProps) => {
  const { t } = useLanguage();

  if (creations.length === 0) {
    return (
      <Card className="p-8 text-center border-dashed">
        <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">{t('expert_studio.no_creations_yet')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('expert_studio.no_creations_hint')}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Camera className="h-5 w-5 text-green-500" />
        {t('expert_studio.creations_from_community')}
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {creations.map((creation) => (
          <CreationNotificationCard key={creation.id} creation={creation} />
        ))}
      </div>
    </div>
  );
};

// Creation Notification Card
interface CreationNotificationCardProps {
  creation: CreationWithDetails;
}

const CreationNotificationCard = ({ creation }: CreationNotificationCardProps) => {
  const { t, language } = useLanguage();

  return (
    <Card className="overflow-hidden hover:border-green-500/50 transition-all">
      {/* Image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={creation.image_url}
          alt={creation.caption || 'Alkotás'}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        {/* Creator */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={creation.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-green-500/20 text-green-500 text-xs">
              {creation.user?.first_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {creation.user?.first_name} {creation.user?.last_name}
          </span>
        </div>

        {/* Based on which content */}
        <p className="text-xs text-muted-foreground mb-2">
          {t('expert_studio.based_on_your')}: {creation.content?.title}
        </p>

        {/* Rating if exists */}
        {creation.rating && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= creation.rating!
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              {t('expert_studio.rating_given')}
            </span>
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(creation.created_at).toLocaleDateString(language === 'hu' ? 'hu-HU' : 'en-US')}
        </p>
      </div>
    </Card>
  );
};

export default CommunityInteractionsTab;
