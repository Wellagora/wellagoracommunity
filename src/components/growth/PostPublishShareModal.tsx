import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ShareToolkit } from '@/components/expert/ShareToolkit';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PostPublishShareModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  programTitle: string;
  programId: string;
  programUrl: string;
}

export const PostPublishShareModal = ({
  isOpen,
  onOpenChange,
  programTitle,
  programId,
  programUrl,
}: PostPublishShareModalProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </motion.div>

          <DialogTitle className="text-center text-xl">
            {t('growth.publish_success')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {t('growth.publish_share_now')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ShareToolkit
            type="program"
            expertName=""
            programTitle={programTitle}
            programUrl={programUrl}
            celebrationMode
          />

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            {t('actions.skip')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
