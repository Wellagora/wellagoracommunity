import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, MessageCircle, Users, Heart } from 'lucide-react';

interface EmptyStateIllustrationProps {
  type: 'no-programs' | 'no-posts' | 'no-participants' | 'no-followers';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyStateIllustration = ({
  type,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateIllustrationProps) => {
  const getIcon = () => {
    const iconClass = 'w-16 h-16 mx-auto mb-4';
    switch (type) {
      case 'no-programs':
        return <BookOpen className={`${iconClass} text-primary/40`} />;
      case 'no-posts':
        return <MessageCircle className={`${iconClass} text-green-500/40`} />;
      case 'no-participants':
        return <Users className={`${iconClass} text-blue-500/40`} />;
      case 'no-followers':
      default:
        return <Heart className={`${iconClass} text-red-500/40`} />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {getIcon()}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground max-w-sm mb-6"
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onAction} className="gap-2">
            {actionLabel}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};
