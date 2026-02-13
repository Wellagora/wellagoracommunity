import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag, BookOpen, MessageSquare, UserPlus } from 'lucide-react';

interface RoleSpecificEmptyStateProps {
  type: 'marketplace' | 'community' | 'programs';
  userRole?: 'expert' | 'member' | 'sponsor' | 'guest';
}

export const RoleSpecificEmptyState = ({ type, userRole }: RoleSpecificEmptyStateProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getEmptyStateContent = () => {
    if (!user && type === 'marketplace') {
      return {
        icon: <UserPlus className="w-12 h-12 text-primary/60" />,
        title: t('growth.empty_marketplace_title'),
        description: t('growth.empty_marketplace_guest'),
        cta: {
          label: t('growth.join_now'),
          action: () => navigate('/auth'),
        },
      };
    }

    if (userRole === 'expert' && type === 'programs') {
      return {
        icon: <BookOpen className="w-12 h-12 text-amber-500/60" />,
        title: t('growth.empty_programs_expert'),
        description: t('growth.create_first_program'),
        cta: {
          label: t('growth.create_now'),
          action: () => navigate('/expert-studio'),
        },
      };
    }

    if (userRole === 'member' && type === 'marketplace') {
      return {
        icon: <ShoppingBag className="w-12 h-12 text-emerald-500/60" />,
        title: t('growth.empty_marketplace_member'),
        description: t('growth.find_programs'),
        cta: {
          label: t('growth.browse_now'),
          action: () => navigate('/piacer'),
        },
      };
    }

    if (userRole === 'member' && type === 'community') {
      return {
        icon: <MessageSquare className="w-12 h-12 text-blue-500/60" />,
        title: t('growth.empty_community_member'),
        description: t('growth.join_discussions'),
        cta: {
          label: t('growth.explore_community'),
          action: () => navigate('/community'),
        },
      };
    }

    return null;
  };

  const content = getEmptyStateContent();
  if (!content) return null;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-5">{content.icon}</div>
      <h3 className="text-xl font-semibold text-center mb-2">{content.title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-8 max-w-sm leading-relaxed">
        {content.description}
      </p>
      <Button onClick={content.cta.action} size="lg" className="gap-2">
        {content.cta.label}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};
