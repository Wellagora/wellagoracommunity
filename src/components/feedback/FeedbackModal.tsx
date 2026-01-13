import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Bug, Lightbulb, HelpCircle, MessageSquare, Send, Loader2, MessageCircleQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

type FeedbackType = 'bug' | 'feature' | 'question' | 'other';

const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
  const { t } = useLanguage();
  const { user, isDemoMode } = useAuth();
  const location = useLocation();
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { value: 'bug' as const, icon: Bug, label: t('feedback.type_bug'), color: 'text-red-500' },
    { value: 'feature' as const, icon: Lightbulb, label: t('feedback.type_feature'), color: 'text-amber-500' },
    { value: 'question' as const, icon: HelpCircle, label: t('feedback.type_question'), color: 'text-blue-500' },
    { value: 'other' as const, icon: MessageSquare, label: t('feedback.type_other'), color: 'text-muted-foreground' },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error(t('feedback.error_empty'));
      return;
    }

    setIsSubmitting(true);

    try {
      // For demo mode, just show success (don't save to DB)
      if (isDemoMode) {
        toast.success(t('feedback.success'));
        setMessage('');
        onClose();
        return;
      }

      // Save to database for real users
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id || null,
        user_email: user?.email || 'anonymous',
        feedback_type: feedbackType,
        message: message.trim(),
        page_url: location.pathname,
        status: 'new'
      });

      if (error) throw error;

      toast.success(t('feedback.success'));
      setMessage('');
      setFeedbackType('bug');
      onClose();
    } catch (error) {
      console.error('Feedback error:', error);
      toast.error(t('feedback.error_submit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    setFeedbackType('bug');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="w-5 h-5 text-blue-600" />
            {t('feedback.title')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {t('feedback.subtitle')}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feedback Type Selection */}
          <div className="space-y-2">
            <Label>{t('feedback.type_label')}</Label>
            <RadioGroup
              value={feedbackType}
              onValueChange={(value) => setFeedbackType(value as FeedbackType)}
              className="grid grid-cols-2 gap-2"
            >
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.value}>
                    <RadioGroupItem
                      value={type.value}
                      id={type.value}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type.value}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                        "hover:border-blue-300 hover:bg-blue-50/50",
                        feedbackType === type.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-border"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", type.color)} />
                      <span className="text-sm">{type.label}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="feedback-message">{t('feedback.message_label')}</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback.message_placeholder')}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Current Page Info */}
          <p className="text-xs text-muted-foreground">
            📍 {t('feedback.current_page')}: {location.pathname}
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            {t('feedback.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {t('feedback.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
