import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';
import { TERMS_CONTENT, CURRENT_TERMS_VERSION } from '@/constants/terms';
import { FileText, Shield, CheckCircle } from 'lucide-react';

interface TermsModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
  showDecline?: boolean;
  isLoading?: boolean;
}

const TermsModal = ({ open, onAccept, onDecline, showDecline = true, isLoading = false }: TermsModalProps) => {
  const { language, t } = useLanguage();
  const [hasRead, setHasRead] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  
  const terms = TERMS_CONTENT[language as keyof typeof TERMS_CONTENT] || TERMS_CONTENT.hu;

  const handleAccept = () => {
    if (hasRead && hasAccepted) {
      onAccept();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-primary" />
            {terms.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            {t('terms.version')}: {CURRENT_TERMS_VERSION} • {terms.lastUpdated}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[50vh] pr-4">
          <div className="space-y-6">
            {terms.sections.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {section.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t flex-shrink-0">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms-read"
              checked={hasRead}
              onCheckedChange={(checked) => setHasRead(checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-read"
              className="text-sm text-foreground cursor-pointer leading-relaxed"
            >
              {t('terms.confirm_read')}
            </label>
          </div>
          
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms-accept"
              checked={hasAccepted}
              onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
              disabled={!hasRead}
              className="mt-0.5"
            />
            <label
              htmlFor="terms-accept"
              className={`text-sm cursor-pointer leading-relaxed ${!hasRead ? 'text-muted-foreground' : 'text-foreground'}`}
            >
              {t('terms.confirm_accept')}
            </label>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          {showDecline && (
            <Button
              variant="outline"
              onClick={onDecline}
              disabled={isLoading}
            >
              {t('terms.decline')}
            </Button>
          )}
          <Button
            onClick={handleAccept}
            disabled={!hasRead || !hasAccepted || isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {t('terms.accept')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsModal;
