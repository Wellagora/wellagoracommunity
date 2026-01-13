import { useState } from 'react';
import { MessageCircleQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import FeedbackModal from './FeedbackModal';

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button - Fixed position, bottom right */}
      {/* HELP BLUE color - distinct from brand/expert/sponsor */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-blue-600 hover:bg-blue-700",
          "hover:scale-110 transition-all duration-200",
          "flex items-center justify-center",
          // Mobile: adjust for bottom nav
          "md:bottom-6 bottom-24"
        )}
        size="icon"
        aria-label="Visszajelzés küldése"
      >
        <MessageCircleQuestion className="w-6 h-6 text-white" />
      </Button>

      {/* Feedback Modal */}
      <FeedbackModal 
        open={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default FeedbackButton;
